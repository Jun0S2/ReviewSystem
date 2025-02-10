export async function askQuestion({ question, pdf_url }) {
    try {
      const baseBackendUrl = process.env.BACKEND_URL || "http://localhost:8000";
      const endpoint = "/ask-question";
      const backendUrl = `${baseBackendUrl}${endpoint}`;
    
      const payload = { question, pdf_url };
      console.log("Sending payload:", payload);  // 확인용 로그
    
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        throw new Error("Failed to fetch answer from backend");
      }
    
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("askQuestion 함수 내부 오류:", error);
      throw error;
    }
  }
  