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

version 0.1

- openai : 0.28.0
- Tried using Hugging face but it kept failing due to hw limitations
- gpt 4o mini

```
Downloading PDF...
PDF successfully downloaded: paper.pdf
Validating PDF...
PDF validation successful.
Extracting text from PDF...
Text extraction successful.
Splitting text into chunks...
Generating summary...
Generated 35 chunks for processing.
Generated summary: The paper discusses the development and evaluation of Retrieval-Augmented Generation (RAG) models for knowledge-intensive NLP tasks. RAG models combine pre-trained parametric memory, typically from sequence-to-sequence (seq2seq) models, with non-parametric memory accessed through a retriever. This hybrid approach aims to address limitations of traditional large pre-trained language models, such as their inability to effectively access and update factual knowledge. The authors present two formulations of RAG: RAG-Sequence, which uses the same retrieved document for generating an entire sequence, and RAG-Token, which allows for different documents to influence each output token. The models were fine-tuned and evaluated on a variety of tasks, including open-domain question answering and language generation, demonstrating state-of-the-art performance on several benchmarks and outperforming traditional parametric models.

RAG's architecture enables it to generate more factual, specific, and diverse outputs compared to baseline models. The paper also highlights the model's ability to update its knowledge dynamically by swapping its non-parametric memory, enhancing its adaptability to changing information over time. The results emphasize the effectiveness of combining parametric and non-parametric approaches in NLP, suggesting new avenues for research into how these memory types can be integrated for improved performance across various tasks.
INFO:     127.0.0.1:53148 - "POST /generate-summary HTTP/1.1" 200 OK
^CINFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [97858]
INFO:     Stopping reloader process [96771]
```
