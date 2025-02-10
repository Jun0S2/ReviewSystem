# main.py
from fastapi.middleware.cors import CORSMiddleware  # 체팅을 위해 CORS 추가
from fastapi import FastAPI
from db import engine, Base
from routers import pdf, user
from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경 변수를 로드합니다.

# 개발 환경에서 테이블이 없으면 생성 (운영시에는 마이그레이션 도구 사용 권장)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF Summary API with DB Integration")
# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용 (GET, POST 등)
    allow_headers=["*"],  # 모든 헤더 허용
)
# 라우터 포함
app.include_router(pdf.router)
app.include_router(user.router)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the PDF Summary API with DB Integration"}
