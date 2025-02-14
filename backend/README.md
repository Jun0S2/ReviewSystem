```
pip install -r requirements.txt
pip install langchain-ollama
uvicorn main:app --reload
```

# Directory

```
project/
├── main.py
├── db.py
├── models.py
├── utils.py         # 기존 PDF 처리 관련 유틸 함수들
├── routers/
│   ├── pdf.py       # PDF 관련 엔드포인트 (DB 저장/조회 + PDF 처리)
│   └── user.py      # 사용자 관련 엔드포인트 (유저 생성, 조회, 유저- PDF 연관)
└── requirements.txt

```

### API Lists

http://127.0.0.1:8000/docs

### Requirements

- fastapi
- uvicorn
- pydantic


<details>
<summary>As Is</summary>
INFO: Application startup complete.
{'summary': "The paper discusses Retrieval-Augmented Generation (RAG), a novel approach that integrates parametric and non-parametric memory to enhance the performance of knowledge-intensive natural language processing (NLP) tasks. Traditional large pre-trained language models, while effective, struggle with accessing and manipulating factual knowledge, leading to limitations in performance on specific tasks. RAG addresses this by combining a pre-trained sequence-to-sequence (seq2seq) model with a retrieval mechanism that accesses a dense vector index of Wikipedia. This hybrid architecture allows the model to generate more accurate and diverse responses in various tasks, significantly outperforming both pure parametric models and specialized architectures in open-domain question answering, abstractive text generation, and fact verification.\n\nThe authors present two formulations of RAG: RAG-Sequence, which uses the same retrieved passage for generating the entire output sequence, and RAG-Token, which can utilize different passages for each token generated. The results showcase that RAG models achieve state-of-the-art performance on multiple benchmarks, including open-domain QA tasks, and demonstrate the ability to produce more factual and specific language outputs compared to traditional models. Additionally, RAG's retrieval component can be easily updated with new information, making it adaptable to changes in knowledge over time. Overall, RAG represents a significant advancement in the field of NLP, providing a powerful tool for tasks that require extensive factual knowledge.", 'highlighted_sentences': ['Retrieval-Augmented Generation for\nKnowledge-Intensive NLP Tasks\nPatrick Lewis†‡, Ethan Perez⋆,\nAleksandra Piktus†, Fabio Petroni†, Vladimir Karpukhin†, Naman Goyal†, Heinrich Küttler†,\nMike Lewis†, Wen-tau Yih†, Tim Rocktäschel†‡, Sebastian Riedel†‡, Douwe Kiela†\n†Facebook AI Research;‡University College London;⋆New York University;\nplewis@fb.com\nAbstract\nLarge pre-trained language models have been shown to store factual knowledge\nin their parameters, and achieve state-of-the-art results when ﬁne-tuned on down-\nstream NLP tasks.', 'However, their ability to access and precisely manipulate knowl-\nedge is still limited, and hence on knowledge-intensive tasks, their performance\nlags behind task-speciﬁc architectures.', 'Additionally, providing provenance for their\ndecisions and updating their world knowledge remain open research problems.', 'Pre-\ntrained models with a differentiable access mechanism to explicit non-parametric\nmemory have so far been only investigated for extractive downstream tasks.', 'We\nexplore a general-purpose ﬁne-tuning recipe for retrieval-augmented generation\n(RAG) — models which combine pre-trained parametric and non-parametric mem-\nory for language generation.'], 'title': 'Retrieval-Augmented Generation for', 'authors': ['both the generator and retriever are jointly learned.']}
INFO: 127.0.0.1:53442 - "POST /process-pdf HTTP/1.1" 200 OK

-> author 와 title 을 제대로 못가져 오고 있음.
-> 최근 버전에서는 prompting 을 통해 개선 완료함.
</details>

# LangChain

```
prompt = PromptTemplate(input_variables=['text'], template=author_prompt_template)
chain = prompt | llm | StrOutputParser()
authors_response = chain.invoke(input={"text": first_page_text})
```

- PromptTemplate: 입력 데이터를 기반으로 동적인 프롬프트 생성.
- ChatOllama: LLM 호출 (Ollama 모델을 사용).
- StrOutputParser: 모델의 출력을 파싱해서 문자열로 변환.

## LangChain 적용

- 저자 추출 (get_authors): LangChain을 통해 Ollama에게 저자 목록만 반환하도록 요청.
- 요약 생성 (generate_summary_with_ollama): 논문 내용을 요약하는 데 LangChain 체인을 사용.
- 질문 응답 시스템 (get_enhanced_answer_template): 논문 내용을 기반으로 질문에 답변하는 데 사용.

### 프롬프트 수정을 통해 답변 능력 향상

<details>
  <summary>Before</summary>

### Template

```
 """
        You are a helpful assistant that answers questions based on the provided PDF content.
        Follow these steps to answer the user's question:

        1. Analyze the user's question: {question}
        2. Search the following text for relevant information:
            {text}
        3. If the information is found in the text:
            - Provide a detailed and accurate answer.
            - Include relevant context or explanations.
        4. If the information is not found in the text:
            - State that the answer is not available in the PDF.
            - Provide a general answer based on your knowledge, if possible.
        5. If the question involves mathematical expressions or technical details:
            - Break down the explanation into simpler terms.
            - Provide examples or analogies if helpful.

        Always ensure your answer is clear, concise, and well-structured.
    """
```

### Result

```
[Debug] Received question: product structure 가 뭐야?
[Debug] PDF URL: https://arxiv.org/pdf/2501.18326
[Debug] Attempting to download PDF...
[Debug] PDF downloaded successfully.
[Debug] Validating PDF...
[Debug] PDF validation successful.
[Debug] Extracting text from PDF...
[Debug] Text extracted successfully.
[Debug] Running AI model for answer generation...
[Debug] Answer generated: I'll do my best to provide a helpful response based on the provided text. However, I notice that there are multiple questions asked in the text, but none of them seem to be specific or directly related to each other. If you could please clarify which question(s) you'd like me to answer, I'll do my best to provide a detailed and accurate response.

If you're looking for general information on graph theory or computational complexity, I can try to provide some answers based on my knowledge. Alternatively, if you have a specific question in mind that's not directly related to the text, please feel free to ask, and I'll do my best to assist you.

Also, please note that the text appears to be a collection of research papers or articles from a conference or workshop on graph theory and computational complexity. If you're looking for information on a specific topic or question, it might be helpful to try searching online or consulting academic resources related to graph theory or computer science.
INFO:     127.0.0.1:62947 - "POST /ask-question HTTP/1.1" 200 OK
```

</details>
<details>
  <summary>After</summary>
  
### template 수정

```
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
            - Provide a general explanation or definition of the term "{question}" based on your knowledge.
            - If the term relates to a known field (e.g., mathematics, computer science), explain its relevance in that context.

        Ensure your answer is easy to understand and well-structured.
    """

```

### Result

```
 Running AI model for answer generation...
[Debug] Answer generated: Unfortunately, the provided PDF does not contain the specific information I need to provide an accurate answer. The text appears to be a collection of academic papers and references related to graph theory and combinatorics, but it does not cover the topic "product structure" directly.

However, based on my general knowledge, I can provide a definition and explanation of product structure in the context of graph theory.

**Product Structure:**

In graph theory, the concept of product structure refers to a way of describing the relationship between two graphs. Given two graphs G and H, their product structure is defined as the set of all possible combinations of edges from G and H, where each edge from G is paired with each edge from H.

Mathematically, this can be represented as follows:

Let G = (V_G, E_G) and H = (V_H, E_H) be two graphs. The product graph G × H is defined as the graph with vertex set V_G × V_H and edge set {(u,v) | u ∈ V_G, v ∈ V_H ∧ (u,v) ∈ E_G} ∪ {(u,v) | u ∈ V_G, v ∈ V_H ∧ (v,u) ∈ E_H}, where (u,v) ∈ E_H.

The product structure of G and H is the set of all possible edges in this combined graph.

In other contexts, such as computer science or mathematics, the term "product structure" might refer to a different concept. If you could provide more information about what you're looking for, I'd be happy to try and assist further!
INFO:     127.0.0.1:64010 - "POST /ask-question HTTP/1.1" 200 OK

```

</details>

---

# 모델 경량화, 병렬 처리, 부분 fine-tuning(PEFT) 등 적용

## 양자화(Quantization)

모델의 파라미터를 16-bit 또는 8-bit로 줄여 메모리 사용량을 감소시키고, 추론 속도를 향상

## PEFT (Parameter-Efficient Fine-Tuning)

LoRA(Low-Rank Adaptation) 기법을 활용해 모델의 일부 파라미터만 업데이트하거나, 작은 어댑터 모듈을 추가하여 효율적으로 파인튜닝함

### Install

```
pip install accelerate peft transformers

pip install torch==2.1.0+cu121 torchvision==0.16.0+cu121 torchaudio==2.1.0+cu121 -f https://download.pytorch.org/whl/torch_stable.html

```

<details>
<summary>1. 경량화 적용 </summary>

```
# utils.py
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
import torch

# Ollama 모델 초기화 - 경량화 적용

def initialize_quantized_ollama_model():
model_name = "meta-llama/Llama-2-7b-hf" # 사용할 LLM 모델
tokenizer = AutoTokenizer.from_pretrained(model_name)

    # 4-bit 양자화 적용하여 모델 로드
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        load_in_4bit=True,
        device_map="auto"
    )

    return model, tokenizer

# LangChain을 위한 경량화된 모델 초기화

def get_quantized_llm():
from langchain.llms import HuggingFacePipeline
from transformers import pipeline

    model, tokenizer = initialize_quantized_ollama_model()

    # 텍스트 생성 파이프라인 설정
    quantized_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
    llm = HuggingFacePipeline(pipeline=quantized_pipeline)

    return llm

# generate summary 수정

def generate_summary_with_ollama(text: str):
    """
    Generates a summary using a quantized Ollama model.
    """
    try:
        # 양자화된 Ollama 모델 초기화
        llm = get_quantized_llm()

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
        print(f"Error generating summary with quantized Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {e}")

```

</details>

<details>
<summary>2.  PEFT (LoRA 기반 부분 파인튜닝)</summary>

```
from peft import LoraConfig, get_peft_model

def apply_lora_to_model(model):
    """
    Applies LoRA to the quantized model for efficient fine-tuning.
    """
    config = LoraConfig(
        r=8,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],  # Transformer Layer 중 일부만 파인튜닝
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    lora_model = get_peft_model(model, config)
    return lora_model
```

lora model -> Langchain

```
def get_quantized_lora_llm():
    from langchain.llms import HuggingFacePipeline
    from transformers import pipeline

    # 모델 초기화 및 LoRA 적용
    model, tokenizer = initialize_quantized_ollama_model()
    lora_model = apply_lora_to_model(model)

    # 텍스트 생성 파이프라인 설정
    lora_pipeline = pipeline("text-generation", model=lora_model, tokenizer=tokenizer)
    llm = HuggingFacePipeline(pipeline=lora_pipeline)

    return llm
```

pdf.py 에 적용

```
from utils import get_quantized_llm

# Ollama 모델 초기화 부분 수정
llm = get_quantized_llm()

# 요약 생성 (경량화된 Ollama로 변경)
@router.post("/process-pdf", tags=["PDF Processing"])
async def process_pdf(request: SummaryRequest):
    """
    PDF URL을 받아 파일 다운로드 → 검증 → 텍스트 추출 → 제목, 저자, 요약, 주요 문장을 반환합니다.
    """
    pdf_url = request.pdf_url
    pdf_path = "paper.pdf"

    try:
        download_pdf(pdf_url, pdf_path)
        validate_pdf(pdf_path)
        full_text = extract_text_from_pdf(pdf_path)
        title = get_title(full_text)
        authors = get_authors(full_text)

        # 경량화된 모델로 요약 생성
        summary = generate_summary_with_ollama(full_text)
        highlighted_sentences = get_highlighted_sentences(full_text)

        return {
            "title": title,
            "authors": authors,
            "summary": summary,
            "highlighted_sentences": highlighted_sentences,
            "pdf_url": pdf_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

```

</details>

### Hugging Face

- 모델 다운로드 및 관리
- Hugging Face는 다양한 `사전 학습된 모델(pre-trained models)`을 손쉽게 다운로드하고 사용할 수 있는 중앙 저장소 역할
- 예: meta-llama/Llama-2-7b-hf, gpt2, bert-base-uncased 등.

#### 경량화 및 파인튜닝 기능 제공

우리가 사용한 transformers 라이브러리는 Hugging Face에서 제공하는 것으로, `양자화(Quantization)`와 LoRA(부분 파인튜닝) 같은 고급 기능을 지원

#### LangChain과의 통합

FastAPI에서 문서 요약 및 질문 응답 시스템을 구현하면서, LangChain 라이브러리로 LLM(대형 언어 모델)을 활용했는데, 이 과정에서도 Hugging Face 모델들이 필수적으로 활용


# GPU
## AS IS
 author retrieving 이 15분 정도 걸리고, summary 도 생성 못함.
<details>
C:\Users\hp000>nvidia-smi
Tue Feb 11 20:50:15 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 571.96                 Driver Version: 571.96         CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                  Driver-Model | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 3060      WDDM  |   00000000:2B:00.0  On |                  N/A |
|  0%   38C    P8             24W /  170W |     635MiB /  12288MiB |      2%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            3600    C+G   ...t\Edge\Application\msedge.exe      N/A      |
|    0   N/A  N/A            5796    C+G   ...ntrolPanel\SystemSettings.exe      N/A      |
|    0   N/A  N/A            6164    C+G   C:\Windows\explorer.exe               N/A      |
|    0   N/A  N/A            7308    C+G   ...8bbwe\PhoneExperienceHost.exe      N/A      |
|    0   N/A  N/A            8036    C+G   ...crosoft OneDrive\OneDrive.exe      N/A      |
|    0   N/A  N/A            8112    C+G   ..._cw5n1h2txyewy\SearchHost.exe      N/A      |
|    0   N/A  N/A            8136    C+G   ...y\StartMenuExperienceHost.exe      N/A      |
|    0   N/A  N/A           11072    C+G   ...cord\app-1.0.9181\Discord.exe      N/A      |
|    0   N/A  N/A           11568    C+G   ...5n1h2txyewy\TextInputHost.exe      N/A      |
|    0   N/A  N/A           12116    C+G   ...__8wekyb3d8bbwe\HxOutlook.exe      N/A      |
|    0   N/A  N/A           12740    C+G   ...ms\Microsoft VS Code\Code.exe      N/A      |
|    0   N/A  N/A           14968    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           15412    C+G   ...0.2957.140\msedgewebview2.exe      N/A      |
|    0   N/A  N/A           16332    C+G   ...xyewy\ShellExperienceHost.exe      N/A      |
|    0   N/A  N/A           17236    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           18836    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           19432    C+G   ...yb3d8bbwe\WindowsTerminal.exe      N/A      |
|    0   N/A  N/A           19452    C+G   ...Chrome\Application\chrome.exe      N/A      |
|    0   N/A  N/A           19756    C+G   ...0.2957.140\msedgewebview2.exe      N/A      |
|    0   N/A  N/A           21064    C+G   ...Chrome\Application\chrome.exe      N/A      |
+-----------------------------------------------------------------------------------------+
</details>

## TO BE
속도가 확실히 빨라짐
기존 : author retrieving 이 15분 -> 30초 정도로 줄어들음

<details>
C:\Users\hp000>nvidia-smi
Tue Feb 11 21:21:28 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 571.96                 Driver Version: 571.96         CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                  Driver-Model | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 3060      WDDM  |   00000000:2B:00.0  On |                  N/A |
|  0%   52C    P2             75W /  170W |   11950MiB /  12288MiB |     97%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            3600    C+G   ...t\Edge\Application\msedge.exe      N/A      |
|    0   N/A  N/A            5796    C+G   ...ntrolPanel\SystemSettings.exe      N/A      |
|    0   N/A  N/A            6164    C+G   C:\Windows\explorer.exe               N/A      |
|    0   N/A  N/A            7308    C+G   ...8bbwe\PhoneExperienceHost.exe      N/A      |
|    0   N/A  N/A            8036    C+G   ...crosoft OneDrive\OneDrive.exe      N/A      |
|    0   N/A  N/A            8112    C+G   ..._cw5n1h2txyewy\SearchHost.exe      N/A      |
|    0   N/A  N/A            8136    C+G   ...y\StartMenuExperienceHost.exe      N/A      |
|    0   N/A  N/A           11072    C+G   ...cord\app-1.0.9181\Discord.exe      N/A      |
|    0   N/A  N/A           11568    C+G   ...5n1h2txyewy\TextInputHost.exe      N/A      |
|    0   N/A  N/A           12116    C+G   ...__8wekyb3d8bbwe\HxOutlook.exe      N/A      |
|    0   N/A  N/A           12740    C+G   ...ms\Microsoft VS Code\Code.exe      N/A      |
|    0   N/A  N/A           14968    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           15412    C+G   ...0.2957.140\msedgewebview2.exe      N/A      |
|    0   N/A  N/A           16332    C+G   ...xyewy\ShellExperienceHost.exe      N/A      |
|    0   N/A  N/A           17236    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           18464      C   ...s\Python\Python311\python.exe      N/A      |
|    0   N/A  N/A           18836    C+G   ...4__8wekyb3d8bbwe\ms-teams.exe      N/A      |
|    0   N/A  N/A           19432    C+G   ...yb3d8bbwe\WindowsTerminal.exe      N/A      |
|    0   N/A  N/A           19452    C+G   ...Chrome\Application\chrome.exe      N/A      |
|    0   N/A  N/A           19756    C+G   ...0.2957.140\msedgewebview2.exe      N/A      |
|    0   N/A  N/A           21064    C+G   ...Chrome\Application\chrome.exe      N/A      |
+-----------------------------------------------------------------------------------------+
</details>