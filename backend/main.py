# main.py
from fastapi import FastAPI
from db import engine, Base
from routers import pdf, user

from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경 변수를 로드합니다.

# 개발 환경에서 테이블이 없으면 생성 (운영시에는 마이그레이션 도구 사용 권장)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF Summary API with DB Integration")

# 라우터 포함
app.include_router(pdf.router)
app.include_router(user.router)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the PDF Summary API with DB Integration"}
