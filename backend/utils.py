import openai
from fastapi import HTTPException
import os
import requests
from fastapi import HTTPException
from pypdf import PdfReader
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def download_pdf(pdf_url: str, save_path: str):
    """Download a PDF from the given URL."""
    try:
        response = requests.get(pdf_url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download PDF.")
        if "application/pdf" not in response.headers.get("Content-Type", ""):
            raise HTTPException(status_code=400, detail="URL does not point to a valid PDF.")
        with open(save_path, "wb") as f:
            f.write(response.content)
        print(f"PDF successfully downloaded: {save_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading PDF: {str(e)}")

def validate_pdf(file_path: str):
    """Check if the PDF is readable."""
    try:
        reader = PdfReader(file_path)
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="PDF file is empty or unreadable.")
        print("PDF validation successful.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="PDF file is corrupted or unreadable.")

def extract_text_from_pdf(file_path: str):
    """Extracts text from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF contains no extractable text.")
        print("Text extraction successful.")
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

def generate_summary_with_openai(text: str, api_key: str):
    """
    Generates a summary using the OpenAI API.

    :param text: The extracted text from the PDF to summarize.
    :param api_key: Your OpenAI API key.
    :return: The generated summary as a string.
    """
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key is not set.")
    
    openai.api_key = api_key

    try:
        # Call the ChatCompletion API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",  # Ensure you use a valid model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant summarizing text documents."},
                {"role": "user", "content": f"Summarize the following text in 1-2 paragraphs:\n\n{text}"},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        # Extract and return the summary
        return response["choices"][0]["message"]["content"].strip()
    except openai.OpenAIError as e:
        # Correct exception handling for OpenAI API errors
        print(f"Error generating summary with OpenAI: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {e}")
