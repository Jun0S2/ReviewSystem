import openai
from fastapi import HTTPException
import os
import requests
from pypdf import PdfReader
from dotenv import load_dotenv
import re
from langchain_ollama import ChatOllama  # Ollama 추가
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def download_pdf(pdf_url: str, save_path: str):
    """Download a PDF from the given URL."""
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

def validate_pdf(file_path: str):
    """Check if the PDF is readable."""
    try:
        reader = PdfReader(file_path)
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="PDF file is empty or unreadable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="PDF file is corrupted or unreadable.")

def extract_text_from_pdf(file_path: str):
    """Extracts text from a PDF file."""
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

def get_title(text: str):
    """Extracts the title from the first few lines of the text."""
    try:
        lines = text.split("\n")
        for line in lines:
            if len(line.strip()) > 5:  # Arbitrary threshold for title length
                return line.strip()
        return "Unknown Title"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting title: {str(e)}")

def get_authors(text: str):
    """
    Use Ollama to extract authors from the provided text, returning only the names in a clean format.
    
    :param text: Extracted text from the PDF.
    :return: List of author names.
    """
    try:
        # Ollama 모델 초기화
        llm = ChatOllama(model="llama3.2")

        # 저자 추출을 위한 프롬프트 (설명 없이 이름만 반환하도록 명확히 지시)
        author_prompt_template = """
        Extract only the authors' names from the academic paper text below.
        Do NOT include any additional explanations, notes, or prefixes like "The authors are".
        Return the names as a simple comma-separated list.

        Text:
        {text}

        Output:
        """

        # 템플릿 적용
        prompt = PromptTemplate(input_variables=['text'], template=author_prompt_template)
        chain = prompt | llm | StrOutputParser()

        # 논문 첫 페이지 텍스트만 전달 (처리 속도 최적화)
        first_page_text = "\n".join(text.split("\n")[:50])  # 첫 50줄만 사용
        authors_response = chain.invoke(input={"text": first_page_text})

        # 후처리: 불필요한 문구 제거 및 쉼표로 분리
        authors_response = re.sub(r"(The authors.*?:|Note:.*)", "", authors_response, flags=re.IGNORECASE).strip()
        authors = [author.strip() for author in authors_response.split(",") if author.strip()]

        return authors if authors else ["Unknown Author"]

    except Exception as e:
        print(f"Error extracting authors with Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error extracting authors: {e}")

def get_highlighted_sentences(text: str):
    """Identifies important sentences from the text."""
    try:
        sentences = re.split(r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s", text)
        highlighted = [s.strip() for s in sentences if len(s.split()) > 10]  # Sentences with more than 10 words
        return highlighted[:5]  # Return the first 5 highlighted sentences
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting highlighted sentences: {str(e)}")

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

# Ollama를 사용한 요약 생성 함수 추가
def generate_summary_with_ollama(text: str):
    """
    Generates a summary using Ollama.

    :param text: The extracted text from the PDF to summarize.
    :return: The generated summary as a string.
    """
    try:
        # Ollama 모델 초기화
        llm = ChatOllama(model="llama3.2")

        # 요약을 위한 프롬프트 템플릿
        summary_template = """
            You are a helpful assistant summarizing text documents. 
            Summarize the following text in 1-2 paragraphs, focusing on the key points and main ideas:

            {text}
        """
        summary_prompt_template = PromptTemplate(input_variables=['text'], template=summary_template)

        # 체인 실행
        chain = summary_prompt_template | llm | StrOutputParser()
        summary = chain.invoke(input={"text": text})

        return summary.strip()
    except Exception as e:
        print(f"Error generating summary with Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {e}")

# 심층적인 질문을 위한 템플릿 보강
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
