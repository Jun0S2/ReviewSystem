# routers/pdf.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import re


from db import SessionLocal
from models import PdfInfo, User, UserPdf  # User와 UserPdf를 추가로 import
from utils import (
    download_pdf,
    validate_pdf,
    extract_text_from_pdf,
    get_title,
    get_authors,
    generate_summary_with_ollama,  # Ollama로 변경
    get_highlighted_sentences,
    get_enhanced_answer_template
)
from langchain_ollama import ChatOllama  # Ollama로 변경
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate

router = APIRouter()

# --- 데이터베이스 세션 의존성 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic 모델: PDF 처리 요청 시, PDF URL과 사용자 이메일 포함 ---
class ProcessPdfRequest(BaseModel):
    pdf_url: str
    user_email: str
    color: str = None  # Optional field

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

@router.post("/process-pdf-with-user", response_model=PdfInfoResponse, tags=["PDF Processing"])
async def process_pdf_with_user(request: ProcessPdfRequest, db: Session = Depends(get_db)):
    # 1. 들어오는 요청 데이터 로깅
    print("[DEBUG] Incoming request data:", request.dict())

    # 2. 사용자 확인 (이미 등록된 사용자여야 함)
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        print(f"[DEBUG] User not found: {request.user_email}")
        raise HTTPException(status_code=404, detail="User not found. Please log in.")
    else:
        print(f"[DEBUG] User found: {request.user_email} (User ID: {user.id})")

    # 3. PDF URL이 DB에 존재하는지 확인
    pdf_info = db.query(PdfInfo).filter(PdfInfo.pdf_url == request.pdf_url).first()
    if not pdf_info:
        print(f"[DEBUG] PDF not found in DB, processing new PDF: {request.pdf_url}")
        # PDF 처리 로직: 다운로드, 검증, 텍스트 추출, 요약 생성 등
        pdf_path = "paper.pdf"
        try:
            # PDF 다운로드
            print("[DEBUG] Downloading PDF...")
            download_pdf(request.pdf_url, pdf_path)

            # PDF 검증
            print("[DEBUG] Validating PDF...")
            validate_pdf(pdf_path)

            # 텍스트 추출
            print("[DEBUG] Extracting text from PDF...")
            full_text = extract_text_from_pdf(pdf_path)

            # 제목 추출
            print("[DEBUG] Extracting title...")
            title = get_title(full_text)

            # 저자 추출
            print("[DEBUG] Extracting authors...")
            authors = get_authors(full_text)

            # 요약 생성 (Ollama로 변경)
            print("[DEBUG] Generating summary with Ollama...")
            summary = generate_summary_with_ollama(full_text)

            # 주요 문장 추출
            print("[DEBUG] Extracting highlighted sentences...")
            highlighted_sentences = get_highlighted_sentences(full_text)

            # 새 PDF 정보 생성 및 DB에 저장
            print("[DEBUG] Creating new PDF info and saving to DB...")
            pdf_info = PdfInfo(
                pdf_url=request.pdf_url,
                title=title,
                authors=authors,
                summary=summary,
                highlighted_sentences=highlighted_sentences
            )
            db.add(pdf_info)
            db.commit()
            db.refresh(pdf_info)
            print(f"[DEBUG] New PDF info created: {pdf_info.id}")
        except Exception as e:
            print(f"[DEBUG] Error processing PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        print(f"[DEBUG] PDF already exists in DB: {pdf_info.id}")

    # 4. 사용자와 PDF 간의 연관 관계 확인 및 추가 (이미 연결되어 있지 않으면 추가)
    association = db.query(UserPdf).filter(UserPdf.user_id == user.id, UserPdf.pdf_id == pdf_info.id).first()
    if not association:
        print(f"[DEBUG] Creating new association between user {user.id} and PDF {pdf_info.id}")
        association = UserPdf(user_id=user.id, pdf_id=pdf_info.id)
        db.add(association)
        db.commit()
        print(f"[DEBUG] New association created: User {user.id} <-> PDF {pdf_info.id}")
    else:
        print(f"[DEBUG] Association already exists: User {user.id} <-> PDF {pdf_info.id}")

    # 5. PDF 정보를 반환
    print(f"[DEBUG] Returning PDF info: {pdf_info.id}")
    return pdf_info

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

        # 요약 생성 (Ollama로 변경)
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

class QARequest(BaseModel):
    question: str
    pdf_url: str  # PDF URL을 기반으로 질문

@router.post("/ask-question")
async def ask_question(request: QARequest):
    try:
        print(f"[Debug] Received question: {request.question}")
        print(f"[Debug] PDF URL: {request.pdf_url}")

        # 1. PDF 다운로드
        pdf_path = "temp_paper.pdf"
        print("[Debug] Attempting to download PDF...")
        download_pdf(request.pdf_url, pdf_path)
        print("[Debug] PDF downloaded successfully.")

        # 2. PDF 검증
        print("[Debug] Validating PDF...")
        validate_pdf(pdf_path)
        print("[Debug] PDF validation successful.")

        # 3. 텍스트 추출
        print("[Debug] Extracting text from PDF...")
        full_text = extract_text_from_pdf(pdf_path)
        print("[Debug] Text extracted successfully.")

        # 4. 질문에 대한 답변 생성
        answer_template = get_enhanced_answer_template()
        answer_prompt_template = PromptTemplate(input_variables=['question', 'text'], template=answer_template)
        llm = ChatOllama(model="llama3.2")

        print("[Debug] Running AI model for answer generation...")
        chain = answer_prompt_template | llm | StrOutputParser()
        answer = chain.invoke(input={"question": request.question, "text": full_text})
        print("[Debug] Answer generated:", answer)
        answer = re.sub(r'\(\s*\)', '', answer).strip()  # 빈 괄호 제거

        return {"answer": answer}
    
    except Exception as e:
        print(f"[Error] Exception occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")
