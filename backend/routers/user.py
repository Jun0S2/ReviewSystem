# 사용자 생성, 사용자 조회(연관 PDF 정보 포함), 특정 사용자의 PDF 리스트 조회
# routers/user.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from db import SessionLocal
from models import User

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic 모델 (User 관련) ---
class UserCreate(BaseModel):
    email: EmailStr
    password_hash: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    pdfs: list = []  # 연관된 PDF 정보 리스트 (PdfInfo 객체들이 포함됨)

    class Config:
        orm_mode = True


# --- 사용자 관련 엔드포인트 ---

@router.post("/user", response_model=UserResponse, tags=["User DB"])
def set_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(email=user.email, password_hash=user.password_hash)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/user/{user_id}", response_model=UserResponse, tags=["User DB"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # 연결된 PDF 정보(즐겨찾기 등)를 포함하여 반환
    user.pdfs = [assoc.pdf_info for assoc in user.user_pdfs]
    return user


@router.get("/user/{user_id}/pdfs", tags=["User DB"])
def get_user_pdf_list(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    pdf_list = [assoc.pdf_info for assoc in user.user_pdfs]
    return pdf_list
