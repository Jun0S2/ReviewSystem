import dotenv from "dotenv";
import { json } from "@remix-run/node"; // Import json wrapper

dotenv.config();

export async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");

  console.log("Extracted pdf_url:", pdf_url); // Log the extracted pdf_url

  const baseBackendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const endpoint = "/process-pdf-with-user";
  const backendUrl = `${baseBackendUrl}${endpoint}`;

  const payload = {
    pdf_url,
    user_email: "admin@gmail.com",
  };

  console.log("Payload being sent:", payload); // Log the payload

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }

  const data = await response.json();
  return json(data);
}