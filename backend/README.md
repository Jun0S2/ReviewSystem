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

version1.1
INFO: Application startup complete.
{'summary': "The paper discusses Retrieval-Augmented Generation (RAG), a novel approach that integrates parametric and non-parametric memory to enhance the performance of knowledge-intensive natural language processing (NLP) tasks. Traditional large pre-trained language models, while effective, struggle with accessing and manipulating factual knowledge, leading to limitations in performance on specific tasks. RAG addresses this by combining a pre-trained sequence-to-sequence (seq2seq) model with a retrieval mechanism that accesses a dense vector index of Wikipedia. This hybrid architecture allows the model to generate more accurate and diverse responses in various tasks, significantly outperforming both pure parametric models and specialized architectures in open-domain question answering, abstractive text generation, and fact verification.\n\nThe authors present two formulations of RAG: RAG-Sequence, which uses the same retrieved passage for generating the entire output sequence, and RAG-Token, which can utilize different passages for each token generated. The results showcase that RAG models achieve state-of-the-art performance on multiple benchmarks, including open-domain QA tasks, and demonstrate the ability to produce more factual and specific language outputs compared to traditional models. Additionally, RAG's retrieval component can be easily updated with new information, making it adaptable to changes in knowledge over time. Overall, RAG represents a significant advancement in the field of NLP, providing a powerful tool for tasks that require extensive factual knowledge.", 'highlighted_sentences': ['Retrieval-Augmented Generation for\nKnowledge-Intensive NLP Tasks\nPatrick Lewis†‡, Ethan Perez⋆,\nAleksandra Piktus†, Fabio Petroni†, Vladimir Karpukhin†, Naman Goyal†, Heinrich Küttler†,\nMike Lewis†, Wen-tau Yih†, Tim Rocktäschel†‡, Sebastian Riedel†‡, Douwe Kiela†\n†Facebook AI Research;‡University College London;⋆New York University;\nplewis@fb.com\nAbstract\nLarge pre-trained language models have been shown to store factual knowledge\nin their parameters, and achieve state-of-the-art results when ﬁne-tuned on down-\nstream NLP tasks.', 'However, their ability to access and precisely manipulate knowl-\nedge is still limited, and hence on knowledge-intensive tasks, their performance\nlags behind task-speciﬁc architectures.', 'Additionally, providing provenance for their\ndecisions and updating their world knowledge remain open research problems.', 'Pre-\ntrained models with a differentiable access mechanism to explicit non-parametric\nmemory have so far been only investigated for extractive downstream tasks.', 'We\nexplore a general-purpose ﬁne-tuning recipe for retrieval-augmented generation\n(RAG) — models which combine pre-trained parametric and non-parametric mem-\nory for language generation.'], 'title': 'Retrieval-Augmented Generation for', 'authors': ['both the generator and retriever are jointly learned.']}
INFO: 127.0.0.1:53442 - "POST /process-pdf HTTP/1.1" 200 OK

author 와 title 을 제대로 못가져 오고 있음.

## LangChain

답변 능력 최악,,

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

answer

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

template 수정

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

결과

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
