# Supabase에 미리 생성한 테이블 스키마에 맞는 SQLAlchemy 모델을 정의
# models.py
from sqlalchemy import Column, Integer, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from db import Base

class PdfInfo(Base):
    __tablename__ = "pdf_info"
    id = Column(Integer, primary_key=True, index=True)
    pdf_url = Column(Text, unique=True, nullable=False)
    title = Column(Text)
    authors = Column(ARRAY(Text))
    summary = Column(Text)
    highlighted_sentences = Column(ARRAY(Text))
    
    # 유저와의 다대다 관계(연결 테이블)를 위한 관계 설정
    user_pdfs = relationship("UserPdf", back_populates="pdf_info")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    
    user_pdfs = relationship("UserPdf", back_populates="user")


class UserPdf(Base):
    __tablename__ = "user_pdf"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    pdf_id = Column(Integer, ForeignKey("pdf_info.id"), primary_key=True)
    
    user = relationship("User", back_populates="user_pdfs")
    pdf_info = relationship("PdfInfo", back_populates="user_pdfs")
