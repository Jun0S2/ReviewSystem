# routers/pdf.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os

from db import SessionLocal
from models import PdfInfo
from utils import (
    download_pdf,
    validate_pdf,
    extract_text_from_pdf,
    get_title,
    get_authors,
    generate_summary_with_openai,
    get_highlighted_sentences,
)

router = APIRouter()


# --- 데이터베이스 세션 의존성 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic 모델 (PDF DB 관련) ---
class PdfInfoCreate(BaseModel):
    pdf_url: str
    title: str = None
    authors: list[str] = []
    summary: str = None
    highlighted_sentences: list[str] = []


class PdfInfoResponse(BaseModel):
    id: int
    pdf_url: str
    title: str = None
    authors: list[str] = []
    summary: str = None
    highlighted_sentences: list[str] = []

    class Config:
        orm_mode = True


# --- PDF DB 관련 엔드포인트 ---

@router.get("/pdf/{pdf_id}", response_model=PdfInfoResponse, tags=["PDF DB"])
def get_pdf_info(pdf_id: int, db: Session = Depends(get_db)):
    pdf = db.query(PdfInfo).filter(PdfInfo.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    return pdf


@router.post("/pdf", response_model=PdfInfoResponse, tags=["PDF DB"])
def set_pdf_info(pdf: PdfInfoCreate, db: Session = Depends(get_db)):
    existing_pdf = db.query(PdfInfo).filter(PdfInfo.pdf_url == pdf.pdf_url).first()
    if existing_pdf:
        raise HTTPException(status_code=400, detail="PDF already exists")
    new_pdf = PdfInfo(
        pdf_url=pdf.pdf_url,
        title=pdf.title,
        authors=pdf.authors,
        summary=pdf.summary,
        highlighted_sentences=pdf.highlighted_sentences,
    )
    db.add(new_pdf)
    db.commit()
    db.refresh(new_pdf)
    return new_pdf


# --- PDF 처리 (요약 등) 관련 엔드포인트 ---
class SummaryRequest(BaseModel):
    pdf_url: str


@router.post("/process-pdf-test", tags=["PDF Processing"])
async def process_pdf_test(request: SummaryRequest):
    """
    주어진 pdf_url을 받아 더미 데이터를 반환합니다.
    """
    pdf_url = request.pdf_url

    dummy_response = {
        "title": "Retrieval-Augmented Generation for",
        "authors": ["both the generator and retriever are jointly learned."],
        "summary": (
            "The paper discusses Retrieval-Augmented Generation (RAG), a novel approach that integrates "
            "parametric and non-parametric memory to enhance the performance of knowledge-intensive natural "
            "language processing (NLP) tasks. Traditional large pre-trained language models, while effective, "
            "struggle with accessing and manipulating factual knowledge, leading to limitations in performance on "
            "specific tasks. RAG addresses this by combining a pre-trained sequence-to-sequence (seq2seq) model with "
            "a retrieval mechanism that accesses a dense vector index of Wikipedia. This hybrid architecture allows "
            "the model to generate more accurate and diverse responses in various tasks, significantly outperforming "
            "both pure parametric models and specialized architectures in open-domain question answering, abstractive "
            "text generation, and fact verification. The authors present two formulations of RAG: RAG-Sequence, which "
            "uses the same retrieved passage for generating the entire output sequence, and RAG-Token, which can utilize "
            "different passages for each token generated. The results showcase that RAG models achieve state-of-the-art "
            "performance on multiple benchmarks, including open-domain QA tasks, and demonstrate the ability to produce "
            "more factual and specific language outputs compared to traditional models. Additionally, RAG's retrieval "
            "component can be easily updated with new information, making it adaptable to changes in knowledge over time. "
            "Overall, RAG represents a significant advancement in the field of NLP, providing a powerful tool for tasks that "
            "require extensive factual knowledge."
        ),
        "highlighted_sentences": [
            (
                "Retrieval-Augmented Generation for\nKnowledge-Intensive NLP Tasks\nPatrick Lewis†‡, Ethan Perez⋆,\n"
                "Aleksandra Piktus†, Fabio Petroni†, Vladimir Karpukhin†, Naman Goyal†, Heinrich Küttler†,\n"
                "Mike Lewis†, Wen-tau Yih†, Tim Rocktäschel†‡, Sebastian Riedel†‡, Douwe Kiela†\n"
                "†Facebook AI Research;‡University College London;⋆New York University;\nplewis@fb.com\nAbstract\n"
                "Large pre-trained language models have been shown to store factual knowledge\nin their parameters, and achieve "
                "state-of-the-art results when ﬁne-tuned on down-\nstream NLP tasks."
            ),
            "However, their ability to access and precisely manipulate knowl-\nedge is still limited, and hence on knowledge-intensive tasks, their performance\nlags behind task-speciﬁc architectures.",
            "Additionally, providing provenance for their\ndecisions and updating their world knowledge remain open research problems.",
            "Pre-\ntrained models with a differentiable access mechanism to explicit non-parametric\nmemory have so far been only investigated for extractive downstream tasks.",
            "We\nexplore a general-purpose ﬁne-tuning recipe for retrieval-augmented generation\n(RAG) — models which combine pre-trained parametric and non-parametric mem-\nory for language generation.",
        ],
        "pdf_url": pdf_url,
    }
    return dummy_response


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

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key is not set.")

        summary = generate_summary_with_openai(full_text, api_key)
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
