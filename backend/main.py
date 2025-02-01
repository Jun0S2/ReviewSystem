from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from utils import (
    download_pdf,
    validate_pdf,
    extract_text_from_pdf,
    get_title,
    get_authors,
    generate_summary_with_openai,
    get_highlighted_sentences,
)
import os

# FastAPI app initialization
app = FastAPI()

# Pydantic model for request validation
class SummaryRequest(BaseModel):
    pdf_url: str


@app.get("/")
def read_root():
    return {"message": "Welcome to the PDF Summary API!"}


# Test API for process-pdf
@app.post("/process-pdf-test")
async def process_pdf_test(request: SummaryRequest):
    print("Received request:", request)
    pdf_url = request.pdf_url
    pdf_path = "paper.pdf"
    print("PDF URL : " , pdf_url)
    """
    Test API: Returns fixed dummy data without processing a real PDF.
    """
    return {
        "title": "Retrieval-Augmented Generation for",
        "authors": ["both the generator and retriever are jointly learned."],
        "summary": "The paper discusses Retrieval-Augmented Generation (RAG), a novel approach that integrates parametric and non-parametric memory to enhance the performance of knowledge-intensive natural language processing (NLP) tasks. Traditional large pre-trained language models, while effective, struggle with accessing and manipulating factual knowledge, leading to limitations in performance on specific tasks. RAG addresses this by combining a pre-trained sequence-to-sequence (seq2seq) model with a retrieval mechanism that accesses a dense vector index of Wikipedia. This hybrid architecture allows the model to generate more accurate and diverse responses in various tasks, significantly outperforming both pure parametric models and specialized architectures in open-domain question answering, abstractive text generation, and fact verification. The authors present two formulations of RAG: RAG-Sequence, which uses the same retrieved passage for generating the entire output sequence, and RAG-Token, which can utilize different passages for each token generated. The results showcase that RAG models achieve state-of-the-art performance on multiple benchmarks, including open-domain QA tasks, and demonstrate the ability to produce more factual and specific language outputs compared to traditional models. Additionally, RAG's retrieval component can be easily updated with new information, making it adaptable to changes in knowledge over time. Overall, RAG represents a significant advancement in the field of NLP, providing a powerful tool for tasks that require extensive factual knowledge.",
        "highlighted_sentences": [
            'Retrieval-Augmented Generation for\nKnowledge-Intensive NLP Tasks\nPatrick Lewis†‡, Ethan Perez⋆,\nAleksandra Piktus†, Fabio Petroni†, Vladimir Karpukhin†, Naman Goyal†, Heinrich Küttler†,\nMike Lewis†, Wen-tau Yih†, Tim Rocktäschel†‡, Sebastian Riedel†‡, Douwe Kiela†\n†Facebook AI Research;‡University College London;⋆New York University;\nplewis@fb.com\nAbstract\nLarge pre-trained language models have been shown to store factual knowledge\nin their parameters, and achieve state-of-the-art results when ﬁne-tuned on down-\nstream NLP tasks.', 
            'However, their ability to access and precisely manipulate knowl-\nedge is still limited, and hence on knowledge-intensive tasks, their performance\nlags behind task-speciﬁc architectures.',
            'Additionally, providing provenance for their\ndecisions and updating their world knowledge remain open research problems.', 
            'Pre-\ntrained models with a differentiable access mechanism to explicit non-parametric\nmemory have so far been only investigated for extractive downstream tasks.', 
            'We\nexplore a general-purpose ﬁne-tuning recipe for retrieval-augmented generation\n(RAG) — models which combine pre-trained parametric and non-parametric mem-\nory for language generation.',
        ],
        "pdf_url": pdf_url,
    }


# @app.post("/process-pdf")
async def process_pdf(request: SummaryRequest):
    print("Received request:", request)
    """
    Processes the PDF once and extracts text, title, authors, summary, and highlighted sentences.
    """
    pdf_url = request.pdf_url
    pdf_path = "paper.pdf"
    print("PDF URL : " , pdf_url)
    try:
        # Download and validate the PDF
        download_pdf(pdf_url, pdf_path)
        validate_pdf(pdf_path)

        # Extract the full text from the PDF
        full_text = extract_text_from_pdf(pdf_path)

        # Extract title, authors, summary, and highlighted sentences
        title = get_title(full_text)
        authors = get_authors(full_text)
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key is not set.")

        summary = generate_summary_with_openai(full_text, api_key)
        highlighted_sentences = get_highlighted_sentences(full_text)

        print({"summary": summary, "highlighted_sentences": highlighted_sentences, "title": title, "authors": authors})
        # Return all extracted information
        return {
            "title": title,
            "authors": authors,
            "summary": summary,
            "highlighted_sentences": highlighted_sentences,
            "pdf_url": pdf_url,
        }

    except Exception as e:
        print(f"Error in process-pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))
