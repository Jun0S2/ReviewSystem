from langchain.llms import OpenAI
from langchain.chains import load_qa_chain
from langchain.document_loaders import PyPDFLoader
from langchain.agents import initialize_agent, Tool
from langchain.tools import WikipediaQueryRun
from langchain.utilities import WikipediaAPIWrapper
from langchain.tools import GoogleSearchResults
import os

# OpenAI API 설정
openai_api_key = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=openai_api_key, model_name="gpt-4")
# Google API 키와 검색 엔진 ID 설정
google_api_key = os.getenv("GOOGLE_API_KEY")
google_cse_id = os.getenv("GOOGLE_CSE_ID")
  
def initialize_pdf_agent_with_fallback(pdf_path: str):
    """
    PDF 내부 검색 → Wikipedia 검색 → Google 검색 순으로 답변을 시도하는 에이전트.
    """
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    qa_chain = load_qa_chain(llm, chain_type="stuff")
    
    # Wikipedia API 설정
    wiki_api = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
    
    # Google Search API 설정 (fallback)
    google_search = GoogleSearchResults(api_key=google_api_key, cse_id=google_cse_id)

    tools = [
        Tool(
            name="PDF_QA",
            func=lambda question: qa_chain.run(input_documents=documents, question=question),
            description="PDF 내부에서 정보를 검색합니다."
        ),
        Tool(
            name="Wikipedia",
            func=wiki_api.run,
            description="PDF에 정보가 없을 때 Wikipedia에서 정보를 검색합니다."
        ),
        Tool(
            name="Google Search",
            func=google_search.run,
            description="PDF와 Wikipedia에 정보가 없을 때 Google에서 검색합니다."
        ),
    ]
    
    agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
    return agent