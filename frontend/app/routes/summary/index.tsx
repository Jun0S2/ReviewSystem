 /**
 * @description
 * SummaryPage는 사용자가 PDF URL을 입력하고 백엔드로 데이터를 전송하는 폼을 처리합니다. 
 * fetcher.submit을 통해 데이터를 /summary_result로 전송합니다.
 */
 import { useFetcher } from "@remix-run/react";
 import { Card, CardBody } from "@heroui/react";
 import React, { useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 export default function SummaryPage() {
   const fetcher = useFetcher();
   const navigate = useNavigate();
   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     const formData = new FormData(event.target as HTMLFormElement);
 
     // 데이터를 summary_result로 POST
     fetcher.submit(formData, { method: "post", action: "/summary_result" });
     // POST 성공 시 summary_result로 redirect
     window.location.href = "/summary_result";
   };

  useEffect(() => {
    // fetcher 상태가 idle이고, data가 있으면 navigate 실행
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Navigating with data:", fetcher.data);
      navigate("/summary_result", { state: fetcher.data });
    }
  }, [fetcher.state, fetcher.data, navigate]);

  
   return (
     <div className="p-10 relative">
       <div
         className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
         style={{ backgroundImage: `url('https://bg.ibelick.com/')` }}>
         <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
         </div>
       </div>
 
       <div className="flex flex-col justify-center items-center h-[100vh]">
         <div className="text-4xl font-bold mb-8 text-center">Generate Summary</div>
         {/* Card */}
           <Card className="w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200">
            <CardBody>
               <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="pdf_url" className="font-semibold text-gray-600">
                    PDF URL
                  </label>
                  <input
                   type="url"
                   name="pdf_url"
                   id="pdf_url"
                   required
                   className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   placeholder="https://"
                 />
               </div>
 
               <div className="flex flex-col space-y-2">
                 <label htmlFor="pdf_file" className="font-semibold text-gray-600">
                   Or Upload PDF File
                 </label>
                 <input
                   type="file"
                   name="pdf_file"
                   id="pdf_file"
                   accept=".pdf"
                   className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 />
               </div>
 
               <button
                  type="submit"
                 className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
               >
                 Upload
               </button>
             </form>
           </CardBody>
         </Card>
       </div>
     </div>
   );
 }
 
     
 // import { useFetcher } from "@remix-run/react";
 // import { Card, CardBody } from "@heroui/react";
 // import { useNavigate } from "react-router-dom";
 
 // const navigate = useNavigate();
 
 // export default function SummaryPage() {
 // //   const fetcher = useFetcher();
 
 // //   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
 // //     event.preventDefault();
 // //     const formData = new FormData(event.target as HTMLFormElement);
 // //     fetcher.submit(formData, { method: "post", action: "/api/generate-summary" });
 // //   };
 
 //   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
 //     event.preventDefault();
 //     const formData = new FormData(event.target as HTMLFormElement);
 //     const response = await fetch("/api/generate-summary", {
 //       method: "POST",
 //       body: formData,
 //     });
 //     const result = await response.json();
   
 //     // Navigate to the summary result page with data
 //     navigate("/summary_result", { state: result });
 //   };
 //   return (
 //     <div className="p-10 relative">
 //       {/* Background */}
 //       <div
 //         className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
 //         style={{ backgroundImage: url('https://bg.ibelick.com/') }}
 //       >
 //         <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
 //         </div>
 //       </div>
 
 //       {/* Main Content */}
 //       <div className="flex flex-col justify-center items-center h-[100vh]">
 //       <div className="text-4xl font-bold mb-8 text-center">Generate Summary</div>
 
 //         {/* Card */}
 //         <Card className="w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200">
 //           <CardBody>
 //             <form onSubmit={handleSubmit} className="space-y-4">
 //               <div className="flex flex-col space-y-2">
 //                 <label htmlFor="pdf_url" className="font-semibold text-gray-600">
 //                   PDF URL
 //                 </label>
 //                 <input
 //                   type="url"
 //                   name="pdf_url"
 //                   id="pdf_url"
 //                   required
 //                   className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
 //                   placeholder="https://"
 //                 />
 //               </div>
 
 //               <div className="flex flex-col space-y-2">
 //                 <label htmlFor="pdf_file" className="font-semibold text-gray-600">
 //                   Or Upload PDF File
 //                 </label>
 //                 <input
 //                   type="file"
 //                   name="pdf_file"
 //                   id="pdf_file"
 //                   accept=".pdf"
 //                   className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
 //                 />
 //               </div>
 
 //               <button
 //                 type="submit"
 //                 className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
 //               >
 //                 Upload
 //               </button>
 //             </form>
 //           </CardBody>
 //         </Card>
 //       </div>
 
 //       {/* Results */}
 //       {/* {fetcher.data && (
 //         <div className="mt-8 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
 //           <h2 className="text-2xl font-semibold mb-4">Highlighted Sentences:</h2>
 //           <ul className="list-disc pl-5 space-y-2">
 //             {fetcher.data.highlighted_sentences.map((sentence: string, index: number) => (
 //               <li key={index} className="text-gray-700">
 //                 {sentence}
 //               </li>
 //             ))}
 //           </ul>
 
 //           <h2 className="text-2xl font-semibold mt-6 mb-4">Summary:</h2>
 //           <p className="text-gray-700">{fetcher.data.summary}</p>
 //         </div>
 //       )} */}
 //     </div>
 //   );
 // }
 