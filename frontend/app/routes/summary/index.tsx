 /**
 * @description
 * SummaryPage는 사용자가 PDF URL을 입력하고 백엔드로 데이터를 전송하는 폼을 처리합니다. 
 * fetcher.submit을 통해 데이터를 /summary_result로 전송합니다.
 */
import { useFetcher } from "@remix-run/react";
import { Card, CardBody } from "@heroui/react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PDFInput from "~/components/PDFInput";
import { handleSubmit } from "~/routes/api.form-handler";

export default function SummaryPage() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
  
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }
  
      const data = await response.json();
      navigate("/summary_result", { state: data }); // Pass data via state
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the PDF.");
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      navigate("/summary_result", { state: fetcher.data });
    }
  }, [fetcher.state, fetcher.data, navigate]);

  return (
    <div className="p-10 relative">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url('https://bg.ibelick.com/')` }}
      >
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="flex flex-col justify-center items-center h-[100vh]">
        <div className="text-4xl font-bold mb-8 text-center">Generate Summary</div>
        <Card className="w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200">
          <CardBody>
            <PDFInput onSubmit={(e) => handleSubmit(e, navigate)} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}