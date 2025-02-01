import { useLoaderData } from "@remix-run/react";
import { Card, CardBody, Divider } from "@heroui/react";
import { useLocation } from "@remix-run/react";
import MenuBar from "~/components/MenuBar";
import PDFViewer from "~/components/PDFViewer";

export default function SummaryResultPage() {
/**
 * @description
 * async loader -> useLoacation
 * summary 에서 navigate("/summary_result", { state: data }) 는
 * passes data via React Router state, not URL search params.
 * 따라서, loader는 expects state in the URL (?state=...),=> 이 부분이 fail 을 발생함.
 * 
 */
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return <div>Error: No data available</div>;
  }
  /**
   * Get PDF URL to display pdf viewer
   */
  const { title, authors, summary, highlighted_sentences, pdf_url } = data;

  return (
    <>
      {/* 네비바 & 사이드바 추가 */}
      <div className="min-h-screen md:h-screen flex flex-col">
        {/* 배경 */}
        <div
          className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('https://bg.ibelick.com/')` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
          </div>
        </div>

        {/* 메뉴바 */}
        <MenuBar />

        {/* 메인 콘텐츠 */}
        <div className="p-10 relative md:w-4/5 xl:ml-[20%] flex-grow md:h-[calc(100vh-80px)]">
          {/* 3:2 레이아웃 적용 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
            {/* PDF Viewer (3/5 비율) */}
            <Card className="md:col-span-3 w-full h-full flex flex-col">
              <CardBody className="p-10 overflow-y-auto overflow-scroll">
                  <div className="text-lg font-bold mb-4">PDF Viewer</div>
                  <PDFViewer pdfUrl={pdf_url} highlightedSentences={highlighted_sentences} />

                {/* <iframe
                  src={pdf_url}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="PDF Viewer"
                /> */}
              </CardBody>
            </Card>

            {/* Summary (2/5 비율) */}
            <Card className="md:col-span-2 w-full h-full flex flex-col">
              <CardBody className="p-10 overflow-scroll">
                <div className="text-xl font-bold py-5">Generated Summary</div>
                <div className="text-md font-bold">Title: {title || "Unknown Title"}</div>
                <div className="">pdf url : {pdf_url} </div>
                <div className="text-sm font">
                  Authors: {authors.length > 0 ? authors.join(", ") : "Unknown Authors"}
                </div>
                <Divider/>

                <div className="text-lg font-bold py-5">Summary</div>
                <div className="text-md">{summary || "No summary available."}</div>

                <div className="text-lg font-bold py-5">Highlighted Sentences</div>
                <div className="text-md text-gray-500">
                  {highlighted_sentences && highlighted_sentences.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {highlighted_sentences.map((sentence, index) => (
                        <li key={index} className="text-gray-700 bg-yellow-200 p-1 rounded">
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
      </div>
    </>
  );
}
