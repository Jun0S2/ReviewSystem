from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class PaperRequest(BaseModel):
    pdf_url: str
    prompt: str

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

@app.post("/summarize-paper")
async def summarize_paper(request: PaperRequest):
    return {
        "pdf_url": request.pdf_url,
        "summary": f"Summarized paper with prompt: {request.prompt}"
    }
