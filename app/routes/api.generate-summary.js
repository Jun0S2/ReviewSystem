import dotenv from "dotenv";
dotenv.config();

export async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");

  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/generate-summary";

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdf_url }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }

  return response.json();
}
