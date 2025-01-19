import { useLoaderData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { Card, CardBody } from "@heroui/react";
import dotenv from "dotenv";

// 명시적으로 .env 경로 설정
dotenv.config({ path: "../.env" });

// Action: PDF URL을 받아서 백엔드로 데이터 전달
export const action = async ({ request }) => {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");

  // Test Mode 설정 확인
  const useTestMode = process.env.USE_TEST_MODE === "true";

  // Backend API URL 설정
  const backendUrl = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}${useTestMode ? "/process-pdf-test" : "/process-pdf"}`
    : `http://localhost:8000${useTestMode ? "/process-pdf-test" : "/process-pdf"}`;

  console.log("Backend URL:", backendUrl); // 디버깅용 로그

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdf_url }),
  });

  if (!response.ok) {
    throw new Response("Failed to fetch summary", { status: response.status });
  }

  const data = await response.json();

  // 데이터를 쿼리 파라미터 없이 전달
return redirect("/summary_result", {
  headers: {
    "Set-Cookie": `summary_data=${encodeURIComponent(
      JSON.stringify(data)
    )}; Path=/; HttpOnly`,
  },
});
};

// Loader: 쿠키에서 데이터 가져오기
export const loader = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .map((c) => c.split("="))
      .map(([key, ...v]) => [key, decodeURIComponent(v.join("="))])
  );

  const summaryData = cookies["summary_data"];
  if (!summaryData) {
    throw new Response("No data available", { status: 400 });
  }

  return json(JSON.parse(summaryData));
};

// Summary Result Component
export default function SummaryResultPage() {
  const { title, authors, summary, highlighted_sentences } = useLoaderData();

  return (
    <div className="p-10 relative">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url('https://bg.ibelick.com/')` }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center items-center  flex-col md:flex-row md:w-full">
        {/* Summary Section */}
        <div className="md:w-2/5 text-center md:text-left mb-4 md:mb-0 px-5">
          <div className="text-4xl font-bold py-5">Generated Summary</div>

          {/* Title */}
          <div className="text-lg font-bold py-5">
            Title: {title || "Unknown Title"}
          </div>

          {/* Authors */}
          <div className="text-sm font py-5">
            Authors: {authors.length > 0 ? authors.join(", ") : "Unknown Authors"}
          </div>

          {/* Summary */}
          <div className="text-lg font-bold py-5">Summary</div>
          <div className="text-md">{summary || "No summary available."}</div>
        </div>

        {/* PDF Viewer Section */}
        <Card className="md:w-3/5 md:ml-10 w-full h-auto">
          <CardBody className="p-10">
            <div className="text-lg font-bold mb-4">Highlighted Sentences</div>
            <div className="text-md text-gray-500">
              {highlighted_sentences && highlighted_sentences.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {highlighted_sentences.map((sentence: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {sentence}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>No highlighted sentences available.</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}