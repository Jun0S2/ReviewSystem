from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from utils import download_pdf, validate_pdf, extract_text_from_pdf, generate_summary_with_openai
import os

# FastAPI app initialization
app = FastAPI()

# Pydantic model for request validation
class SummaryRequest(BaseModel):
    pdf_url: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the PDF Summary API!"}

@app.post("/generate-summary")
async def generate_summary(request: SummaryRequest):
    pdf_url = request.pdf_url
    pdf_path = "paper.pdf"
    
    try:
        print("Downloading PDF...")
        download_pdf(pdf_url, pdf_path)

        print("Validating PDF...")
        validate_pdf(pdf_path)

        print("Extracting text from PDF...")
        text = extract_text_from_pdf(pdf_path)

        print("Splitting text into chunks...")
        # Split the text into smaller chunks (e.g., 2000 characters each)
        chunk_size = 2000
        print("Generating summary...")
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
        print(f"Generated {len(chunks)} chunks for processing.")

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found in environment variables.")
        
        summary = generate_summary_with_openai(text, api_key)
        
        # Print the generated summary to the console
        print("Generated summary:", summary)
        
        return {"summary": summary}
    except Exception as e:
        print(f"Error in generate-summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
