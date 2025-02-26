import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
  Image,
  Tooltip,
  Input,
  Spinner // 로딩 스피너 추가
} from "@heroui/react";

import { useState } from "react";
import { askQuestion } from "~/routes/api.qa-handler";
import { MessageIcon } from "./icons/MessageIcon";
import ReactMarkdown from 'react-markdown';

export default function App() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How Can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleSend = async () => {
    if (input.trim() !== "") {
      const newMessage = { sender: "user", text: input };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");
      setIsLoading(true); // 로딩 시작

      try {
        const pdf_url = localStorage.getItem("pdf_url");
        if (!pdf_url) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "PDF URL이 없습니다. 먼저 PDF를 업로드해주세요." },
          ]);
          setIsLoading(false); // 로딩 종료
          return;
        }

        const response = await askQuestion({ question: input, pdf_url });

        if (response && response.answer) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: `${response.answer}\n` },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Unable to retreive answers." },
          ]);
        }
      } catch (error) {
        console.error("Error fetching answer:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "An error occured while retreiving an answer. Please try later" },
        ]);
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Tooltip content="Ask AI if you have any questions">
        <Button
            isIconOnly
            aria-label="Chat with AI"
            color="primary"
            size="lg"
            radius="full"
            variant="shadow"
            onPress={onOpen}
            className="fixed bottom-5 left-5 z-[1100]" 
        >
            <MessageIcon />
        </Button>
      </Tooltip>

      <Drawer
        hideCloseButton
        backdrop="opaque"
        classNames={{
          base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2 rounded-medium z-[9999] fixed" 
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
      <div className="z-[10001] relative">
      <DrawerContent className="z-[10000] fixed bg-white h-[100vh] overflow-y-auto">
      {(onClose) => (
            <>
              <DrawerHeader className="absolute top-0 inset-x-0 z-[10000] flex flex-row gap-2 px-2 py-2 border-b border-default-200/50 justify-between bg-content1/50 backdrop-saturate-150 backdrop-blur-lg">
                <Tooltip content="Close">
                  <Button
                    isIconOnly
                    className="text-default-400"
                    size="sm"
                    variant="light"
                    onPress={onClose}
                  >
                    <svg
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                    </svg>
                  </Button>
                </Tooltip>
              </DrawerHeader>
              <DrawerBody className="pt-16">
                <div className="flex w-full justify-center items-center pt-4">
                  <Image
                    isBlurred
                    isZoomed
                    alt="Question image"
                    className="aspect-square w-full hover:scale-110"
                    height={100}
                    src="/qna.png"
                  />
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <h1 className="text-2xl font-bold leading-7">Ask AI about this PDF</h1>
                  <p className="text-sm text-default-500">
                    AI will generate answers
                  </p>
                  <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-100 px-2">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                        >
                          {msg.sender === "bot" ? (
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                              msg.text
                            )}
                        </div>
                      </div>
                    ))}
                    {/* 로딩 중일 때 표시되는 메시지 */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-black flex items-center">
                          <Spinner size="sm" className="mr-2" /> AI가 답변을 작성 중입니다...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DrawerBody>
              <DrawerFooter className="flex flex-col gap-1">
                <div className="flex items-center w-full">
                  <Input
                    className="flex-grow mr-2"
                    placeholder="메시지를 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button color="primary" onPress={handleSend} isDisabled={isLoading}>전송</Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
        </div>
      </Drawer>
    </>
  );
}
