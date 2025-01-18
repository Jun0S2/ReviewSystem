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
    <div className="p-10">
      <div className="flex justify-center items-center h-[100vh] flex-col md:flex-row md:w-full">
        {/* Title and description */}
        <div className="md:w-3/5 text-center md:text-left mb-4 md:mb-0 px-5">
          <div className="text-4xl font-bold py-5">
            PDF Summary
          </div>
          <div className="text-lg font-bold py-5">
            Features
          </div>
          {features.map((feature, index) => (
            <div key={index} className="text-md">
              ✅ {feature}
            </div>
          ))}
          <div className="text-lg font-bold py-5">
            Product Introduction for Landing Page
          </div>
          <div className="text-md">
            Our service helps you streamline your research process by providing concise, easy-to-understand summaries of long academic papers. You can quickly highlight key sentences, manage your uploaded papers, and get insights from AI-powered evaluations (features coming soon). Whether you’re looking to save time or gain a better understanding of your research, our tool is here to support your academic journey.
          </div>
        </div>

        {/* Card containing the Login component */}
        <Card className="md:2/5 w-full h-auto">
          <CardHeader className="text-center">
            <div className="text-xl font-bold">
              Login
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-10">
            <Login />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
