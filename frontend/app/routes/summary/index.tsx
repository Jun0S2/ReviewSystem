 /**
 * @description
 * SummaryPage는 사용자가 PDF URL을 입력하고 백엔드로 데이터를 전송하는 폼을 처리합니다. 
 * fetcher.submit을 통해 데이터를 /summary_result로 전송합니다.
 */
import { useFetcher } from "@remix-run/react";
import { Card, CardBody } from "@heroui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import PDFInput from "~/components/PDFInput";
// 공통 함수 가져오기 (이름을 그대로 사용하거나 별칭을 줄 수 있음)
import { handleSubmit as commonHandleSubmit } from "~/routes/api.form-handler";

export default function SummaryPage() {
  const navigate = useNavigate();

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
            {/* navigate 인자를 함께 전달, color layer style도 추가*/}
            <PDFInput onSubmit={(e) => commonHandleSubmit(e, navigate)}  layoutType="inline"/>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
