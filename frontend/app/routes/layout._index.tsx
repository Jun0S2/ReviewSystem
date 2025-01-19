import { Link } from "@remix-run/react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import Login from "~/components/login";

export default function Index() {
  // Define the list of features
  const features = [
    "Summarize long papers into concise and engaging text.",
    "Highlight Key sentences from your paper",
    "Archive all the papers you uploaded (upcoming feature)",
    "Evaluate your paper with our AI (upcoming feature)"
  ];

  return (
    <div className="p-10 relative">
      {/* Apply the background from the URL */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
           style={{ backgroundImage: `url('https://bg.ibelick.com/')` }}>
        {/* Keep the existing gradient and circular blur */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center items-center h-[100vh] flex-col md:flex-row md:w-full">
        {/* 2/5 : Summarizations */}
        <div className="md:w-2/5 text-center md:text-left mb-4 md:mb-0 px-5">
          <div className="text-4xl font-bold py-5">
            Generated Summary
          </div>
          {/* title of the paper inside the pdf */}
          <div className="text-lg font-bold py-5">
            Title : 
          </div>
          {/* authors of the paper listed inside the pdf */}
          <div className="text-sm font py-5">
            author : 
          </div>
          <div className="text-lg font-bold py-5">
            Summary
          </div>
          {/* Generated summary */}
          <div className="text-md">
            blah blah
          </div>
        </div>

        {/* Right side */}
        <Card className="md:w-3/5 md:ml-10 w-full h-auto">
        {/* PDF Viewer */}
          <CardBody className="p-10">
            {/* Display PDF - and highlight the sentences from highlighted_sentences */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
