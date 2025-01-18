import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline
from pypdf import PdfReader
from langchain_openai.embeddings import OpenAIEmbeddings  # Use updated import
from sentence_transformers import SentenceTransformer
from langchain.embeddings import HuggingFaceEmbeddings

# FastAPI app initialization
app = FastAPI()

# Request model
class SummaryRequest(BaseModel):
    pdf_url: str

# Initialize LLM (using OpenLLM)
def get_openllm():
    return HuggingFacePipeline(pipeline("text-generation", model="tiiuae/falcon-7b-instruct"))

# Download PDF from URL
def download_pdf(pdf_url: str, save_path: str):
    try:
        response = requests.get(pdf_url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to download PDF. Status code: {response.status_code}")
        if "application/pdf" not in response.headers.get("Content-Type", ""):
            raise HTTPException(status_code=400, detail="The URL does not point to a valid PDF file")
        with open(save_path, "wb") as f:
            f.write(response.content)
        print(f"PDF downloaded successfully and saved to {save_path}")
    except Exception as e:
        print(f"Error while downloading PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while downloading PDF: {str(e)}")

# Validate if the PDF is readable
def validate_pdf(file_path: str):
    try:
        reader = PdfReader(file_path)
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="PDF file is empty or unreadable")
        print("PDF validation successful.")
    except Exception as e:
        print(f"Error validating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail="PDF file is corrupted or unreadable")

# Load and split PDF into chunks
def load_and_split_pdf(file_path: str, chunk_size=1000, chunk_overlap=200):
    try:
        loader = PyPDFLoader(file_path)
        raw_docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        split_docs = splitter.split_documents(raw_docs)
        return split_docs
    except Exception as e:
        print(f"Error loading or splitting PDF: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing the PDF file")

# Update create_vectorstore to use free Hugging Face embeddings
def create_vectorstore(docs):
    try:
        # Use a free Hugging Face embedding model like 'all-MiniLM-L6-v2'
        embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        return Chroma.from_documents(documents=docs, embedding=embedding_model)
    except Exception as e:
        print(f"Error creating vectorstore: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating vectorstore")

# def create_vectorstore(docs):
#     try:
#         embedding_model = OpenAIEmbeddings(api_key="your-openai-api-key")  # Replace with your OpenAI API key
#         return Chroma.from_documents(documents=docs, embedding=embedding_model)
#     except Exception as e:
#         print(f"Error creating vectorstore: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error creating vectorstore")

# Generate highlighted sentences and summary
@app.post("/generate-summary")
async def generate_summary_api(request: SummaryRequest):
    pdf_url = request.pdf_url
    pdf_path = "paper.pdf"

    try:
        print("Starting PDF download...")
        download_pdf(pdf_url, pdf_path)
        print(f"PDF downloaded to {pdf_path}")

        print("Validating PDF...")
        validate_pdf(pdf_path)

        print("Loading and splitting PDF...")
        split_docs = load_and_split_pdf(pdf_path)

        print("Creating vectorstore...")
        vectorstore = create_vectorstore(split_docs)
        retriever = vectorstore.as_retriever()

        print("Retrieving relevant documents...")
        retrieved_docs = retriever.get_relevant_documents("Identify important sentences and summarize")
        highlighted_sentences = [doc.page_content for doc in retrieved_docs]

        print("Generating summary...")
        context = "\n\n".join(highlighted_sentences)
        llm = get_openllm()
        llm_prompt = f"Summarize the following content within 1-2 pages:\n\n{context}"
        response = llm(llm_prompt)

        os.remove(pdf_path)  # Clean up temporary file
        print("Summary generation complete.")
        return {
            "highlighted_sentences": highlighted_sentences,
            "summary": response
        }
    except Exception as e:
        print(f"Error in generate-summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
