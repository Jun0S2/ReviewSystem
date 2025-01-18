# Architecture

```bash
project/
├── backend/               # Python 백엔드 코드 (FastAPI 등)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI 진입점
│   │   ├── utils.py       # 공통 유틸리티 함수
│   │   └── models.py      # 데이터 모델 정의
│   ├── tests/             # 백엔드 테스트 코드
│   └── requirements.txt   # Python 라이브러리 목록
├── frontend/              # Remix 프론트엔드 코드
│   ├── app/
│   │   ├── components/    # React 컴포넌트
│   │   ├── routes/        # Remix 라우트 (페이지별)
│   │   ├── styles/        # CSS/스타일 파일
│   │   └── utils/         # 프론트엔드 유틸리티 함수
│   ├── public/            # 정적 파일 (이미지, 아이콘 등)
│   ├── package.json       # Node.js 의존성 목록
│   └── remix.config.js    # Remix 설정 파일
├── README.md              # 프로젝트 설명서
└── .gitignore             # Git 무시 파일
```

## Backend

주요 파일:

- `main.py`: FastAPI 애플리케이션의 진입점. API 엔드포인트를 정의합니다.
- `models.py`: 데이터 모델 정의 (예: Pydantic 모델).
- `utils.py`: 재사용 가능한 유틸리티 함수 (예: 텍스트 추출 함수).
- `requirements.txt`: FastAPI, Transformers, PyPDF2 등 설치할 라이브러리 목록.
- `Dockerfile`: 선택적으로 Docker로 백엔드를 배포할 때 사용합니다.

## frontend

Remix 기반의 프론트엔드 애플리케이션을 관리합니다.

주요 폴더/파일:

- `routes/`: Remix의 페이지별 라우트 구성.
  - 예: `/upload` 라우트에 PDF 업로드 기능 구현.
- `components/`: 재사용 가능한 React 컴포넌트.
  - 예: 파일 업로드 버튼, 결과 표시 카드.
- `utils/`: 프론트엔드 유틸리티 함수 (예: Python 서버 호출 함수).
- nextui-> heroui 사용
