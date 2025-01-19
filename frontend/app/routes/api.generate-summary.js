import dotenv from "dotenv";
dotenv.config();

export async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");

  // Determine the backend URL dynamically
  const baseBackendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const useTestMode = process.env.USE_TEST_MODE === "true"; // Read from environment variables
  const endpoint = useTestMode ? "/process-pdf-test" : "/process-pdf"; // Switch based on test mode
  const backendUrl = `${baseBackendUrl}${endpoint}`; // Combine base URL with endpoint

  // Call the backend API
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
