import { useState } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import PDFInput from "~/components/PDFInput";
import { handleSubmit as commonHandleSubmit } from "~/routes/api.form-handler";

/**
 * @description
 * SummaryPage는 사용자가 PDF URL을 입력하고 백엔드로 데이터를 전송하는 폼을 처리합니다. 
 * fetcher.submit을 통해 데이터를 /summary_result로 전송합니다.
 */
export default function SummaryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 폼 제출 핸들러 수정
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // 기본 제출 방지
    setIsLoading(true); // 로딩 시작

    try {
      // 공통 제출 핸들러 호출 (navigate를 함께 전달)
      await commonHandleSubmit(e, navigate);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false); // 제출 완료 후 로딩 종료
    }
  };

  return (
    <div className="p-10 relative">
      {/* 배경 이미지 */}
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
            {/* 로딩 중일 때 스피너 표시 */}
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Spinner size="lg" color="primary" /> {/* 로딩 스피너 */}
                <span className="ml-4 text-lg font-medium text-gray-600">Processing PDF...</span>
              </div>
            ) : (
              <PDFInput onSubmit={handleFormSubmit} layoutType="inline" />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
