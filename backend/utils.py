import openai
from fastapi import HTTPException
import os
import requests
from pypdf import PdfReader
from dotenv import load_dotenv
import re
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
import torch
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor  # 병렬 처리
from torch.utils.data import DataLoader

# 환경 변수 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL_TYPE = os.getenv("MODEL_TYPE", "lora")  # 기본값은 lora
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "llama3.2")  # Ollama 모델 이름

llm = None  # 전역 변수 선언
tokenizer = None
model = None

# LoRA 모델 초기화 및 GPU 이동
def get_lora_llm():
    global tokenizer, model
    model_name = "meta-llama/Llama-2-7b-hf"
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=HUGGINGFACE_API_KEY)
    model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", token=HUGGINGFACE_API_KEY)
    
    # LoRA 적용
    config = LoraConfig(r=8, lora_alpha=32, target_modules=["q_proj", "v_proj"], lora_dropout=0.05, bias="none", task_type="CAUSAL_LM")
    lora_model = get_peft_model(model, config)
    lora_model = lora_model.to("cuda")  # LoRA 모델을 GPU로 이동
    
    def lora_generate(prompt):
        inputs = tokenizer(prompt, return_tensors="pt").to(lora_model.device)  # 입력 데이터를 GPU로 이동
        output = lora_model.generate(**inputs, max_new_tokens=50)
        return tokenizer.decode(output[0], skip_special_tokens=True)

    return lora_generate

# 양자화 모델 초기화 및 GPU 이동
def get_quantized_llm():
    global tokenizer, model
    model_name = "meta-llama/Llama-2-7b-hf"
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=HUGGINGFACE_API_KEY)
    
    # device_map="auto" 제거 후 수동으로 cuda로 설정
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        token=HUGGINGFACE_API_KEY
    ).to("cuda")  # 모델을 GPU로 직접 이동
    
    # 모델이 GPU에 있는지 확인
    print(f"Model device: {model.device}")  # 출력: cuda:0

    def quantized_generate(prompt):
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)  # 입력 데이터를 GPU로 이동
        print(f"Inputs device: {inputs['input_ids'].device}")  # 입력 데이터가 GPU에 있는지 확인 (출력: cuda:0)
        outputs = model.generate(**inputs, max_new_tokens=150)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)

    return quantized_generate

# PDF 다운로드
def download_pdf(pdf_url: str, save_path: str):
    try:
        response = requests.get(pdf_url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download PDF.")
        if "application/pdf" not in response.headers.get("Content-Type", ""):
            raise HTTPException(status_code=400, detail="URL does not point to a valid PDF.")
        with open(save_path, "wb") as f:
            f.write(response.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading PDF: {str(e)}")

# PDF 검증
def validate_pdf(file_path: str):
    try:
        reader = PdfReader(file_path)
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="PDF file is empty or unreadable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="PDF file is corrupted or unreadable.")

# PDF 텍스트 추출
def extract_text_from_pdf(file_path: str):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF contains no extractable text.")
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

# 제목 추출
def get_title(text: str):
    try:
        lines = text.split("\n")
        for line in lines:
            if len(line.strip()) > 5:
                return line.strip()
        return "Unknown Title"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting title: {str(e)}")

# 저자 추출
def get_authors(text: str):
    try:
        author_prompt_template = """
        Extract only the authors' names from the academic paper text below.
        Do NOT include any additional explanations, notes, or prefixes like "The authors are".
        Return the names as a simple comma-separated list.

        Text:
        {text}

        Output:
        """
        first_page_text = "\n".join(text.split("\n")[:50])
        formatted_prompt = author_prompt_template.format(text=first_page_text)

        with tqdm(total=3, desc="Extracting Authors", bar_format="{l_bar}{bar} [ time left: {remaining} ]") as pbar:
            if callable(llm):
                authors_response = llm(formatted_prompt)
            elif isinstance(llm, ChatOllama):
                prompt = PromptTemplate(input_variables=['text'], template=author_prompt_template)
                chain = prompt | llm | StrOutputParser()
                authors_response = chain.invoke(input={"text": first_page_text})
            else:
                raise HTTPException(status_code=500, detail="No valid LLM model initialized.")
            pbar.update(1)

            authors_response = re.sub(r"(The authors.*?:|Note:.*)", "", authors_response, flags=re.IGNORECASE).strip()
            pbar.update(1)
            authors = [author.strip() for author in authors_response.split(",") if author.strip()]
            pbar.update(1)

        return authors if authors else ["Unknown Author"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting authors: {e}")

# 주요 문장 추출
def get_highlighted_sentences(text: str):
    try:
        sentences = re.split(r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s", text)
        highlighted = [s.strip() for s in sentences if len(s.split()) > 10]
        return highlighted[:5]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting highlighted sentences: {str(e)}")

# 텍스트 분할
def split_text(text, chunk_size=2000):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

# OpenAI API를 사용하여 LLM 호출
def get_openai_llm():
    def openai_generate(prompt):
        openai.api_key = OPENAI_API_KEY  # OpenAI API 키 설정
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",  # 사용하려는 OpenAI 모델
                messages=[
                    {"role": "system", "content": "You are a helpful assistant summarizing text documents."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=500,
                temperature=0.7,
            )
            return response["choices"][0]["message"]["content"].strip()
        except openai.OpenAIError as e:
            print(f"Error generating response with OpenAI: {e}")
            raise HTTPException(status_code=500, detail=f"Error generating response: {e}")

    return openai_generate

def generate_summary_with_openai(text: str, api_key: str):
    """
    Generates a summary using the OpenAI API.

    :param text: The extracted text from the PDF to summarize.
    :param api_key: Your OpenAI API key.
    :return: The generated summary as a string.
    """
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key is not set.")
    
    openai.api_key = api_key

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",  # Ensure you use a valid model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant summarizing text documents."},
                {"role": "user", "content": f"Summarize the following text in 1-2 paragraphs:\n\n{text}"},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return response["choices"][0]["message"]["content"].strip()
    except openai.OpenAIError as e:
        print(f"Error generating summary with OpenAI: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {e}")

# 개별 청크 요약
def summarize_chunk(chunk):
    summary_template = """
        You are a helpful assistant summarizing academic papers.
        Summarize the following text concisely, focusing on the key findings and results:
        {text}
    """
    prompt = PromptTemplate(input_variables=['text'], template=summary_template)
    prompt_value = prompt.format(text=chunk)
    summary = llm(prompt_value).strip()
    return summary

# 병렬 처리로 청크 요약
def batch_summarize(chunks):
    summaries = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = list(tqdm(executor.map(summarize_chunk, chunks), total=len(chunks), desc="Generating Summaries", bar_format="{l_bar}{bar} [ Time left: {remaining} ]"))
        summaries.extend(futures)
    return summaries

# 전체 요약 생성
def generate_summary(text: str):
    try:
        chunks = split_text(text)
        partial_summaries = batch_summarize(chunks)
        combined_summary = " ".join(partial_summaries)
        
        final_summary_template = """
            You are a helpful assistant. Summarize the following summaries into one concise paragraph:
            {text}
        """
        final_prompt = PromptTemplate(input_variables=['text'], template=final_summary_template)
        final_prompt_value = final_prompt.format(text=combined_summary)
        
        final_summary = llm(final_prompt_value).strip()
        return final_summary

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {e}")

# utils.py 파일에 이 함수가 있어야 합니다.
def get_enhanced_answer_template():
    return """
        You are a helpful assistant that answers questions based on the provided PDF content.
        Follow these steps to answer the user's question:

        1. Analyze the user's question: {question}
        2. Search the provided text for relevant information:
            {text}

        If you find the answer in the text:
            - Provide a clear, detailed, and concise explanation.
            - Include context from the text when relevant.

        If the answer is NOT found in the text:
            - Clearly state: "The specific answer to your question was not found in the provided PDF."
            - Provide a general explanation or definition of the term "{question}" based on your knowledge."
            - If relevant, explain its significance in related fields.

        Ensure your answer is easy to understand and well-structured without unnecessary formatting.
    """

# 모델 초기화
def initialize_model():
    global llm
    if llm is not None:
        return llm
    
    if MODEL_TYPE == "quantized":
        llm = get_quantized_llm()
    elif MODEL_TYPE == "ollama":
        llm = ChatOllama(model=OLLAMA_MODEL_NAME)
    elif MODEL_TYPE == "lora":
        llm = get_lora_llm()
    else:
        llm = get_openai_llm()
    return llm

# 서버 시작 시 모델 초기화
llm = initialize_model()
