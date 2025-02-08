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
  } from "@heroui/react";
  
  import { useState } from "react";
  import { MessageIcon } from "./icons/MessageIcon";
  
  export default function App() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [messages, setMessages] = useState([
      { sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }
    ]);
    const [input, setInput] = useState("");
  
    const handleSend = () => {
      if (input.trim() !== "") {
        const newMessage = { sender: "user", text: input };
        setMessages([...messages, newMessage]);
        setInput("");
  
        // Placeholder for bot response
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "입력하신 내용을 처리했습니다." }
          ]);
        }, 500);
      }
    };
  
    return (
      <>
        {/* Floating Button */}
        <Button
            isIconOnly
            aria-label="Chat with AI"
            color="danger"
            size="lg"
            radius="full"
            variant="flat"
            onPress={onOpen}
            className="fixed bottom-5 left-5 z-50 shadow-lg"  
        >
            <MessageIcon />
        </Button>
        <Drawer
          hideCloseButton
          backdrop="blur"
          classNames={{
            base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2 rounded-medium"
          }}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="absolute top-0 inset-x-0 z-50 flex flex-row gap-2 px-2 py-2 border-b border-default-200/50 justify-between bg-content1/50 backdrop-saturate-150 backdrop-blur-lg">
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
                      height={40}
                      src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/places/san-francisco.png"
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
                            {msg.text}
                          </div>
                        </div>
                      ))}
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
                    <Button color="primary" onPress={handleSend}>전송</Button>
                  </div>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  