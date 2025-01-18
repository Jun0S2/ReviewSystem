from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Request body model
class PaperRequest(BaseModel):
    pdf_url: str
    prompt: str

# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "Backend is running!"}

# /summarize-paper endpoint
@app.post("/summarize-paper")
async def summarize_paper(request: PaperRequest):
    response = {
        "pdf_url": request.pdf_url,
        "summary": f"Summarized paper with prompt: {request.prompt}"
    }
    print("Response:", response)  # Log response to the terminal
    return response
