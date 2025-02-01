import dotenv from "dotenv";
import { json } from "@remix-run/node"; // Import json wrapper

dotenv.config();

export async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");

  const baseBackendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const useTestMode = process.env.USE_TEST_MODE === "true";
  const endpoint = useTestMode ? "/process-pdf-test" : "/process-pdf";
  const backendUrl = `${baseBackendUrl}${endpoint}`;

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

  const data = await response.json();
  // return data; // Return the data directly
  return json(data);
}