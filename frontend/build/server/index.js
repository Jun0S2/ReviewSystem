import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useLocation } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { HeroUIProvider, Navbar, NavbarContent, NavbarMenuToggle, NavbarBrand, NavbarItem, Button, NavbarMenu, NavbarMenuItem, Card, CardHeader, Divider, CardBody, Tooltip, useDisclosure, Drawer, DrawerContent, DrawerHeader, DrawerBody, Image, Spinner, DrawerFooter, Input, Link, Avatar, Form, Select, SelectItem } from "@heroui/react";
import dotenv from "dotenv";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import ReactMarkdown from "react-markdown";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const loader = async () => {
  return json({
    ENV: {
      BACKEND_URL: "http://localhost:8000"
    }
  });
};
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs(HeroUIProvider, { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] }) })
  ] });
}
function App$2() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App$2,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
dotenv.config();
async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");
  console.log("Extracted pdf_url:", pdf_url);
  const baseBackendUrl = "http://localhost:8000";
  const endpoint = "/process-pdf-with-user";
  const backendUrl = `${baseBackendUrl}${endpoint}`;
  const payload = {
    pdf_url,
    user_email: "admin@gmail.com"
  };
  console.log("Payload being sent:", payload);
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }
  const data = await response.json();
  return json(data);
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const handleSubmit = async (event, navigate) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const selectedColor = formData.get("color");
  console.log("selected color : ", selectedColor);
  try {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the backend");
    }
    const data = await response.json();
    navigate("/summary_result", { state: { ...data, color: selectedColor } });
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while processing the PDF.");
  }
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  handleSubmit
}, Symbol.toStringTag, { value: "Module" }));
async function askQuestion({ question, pdf_url }) {
  try {
    const baseBackendUrl = "http://localhost:8000";
    const endpoint = "/ask-question";
    const backendUrl = `${baseBackendUrl}${endpoint}`;
    const payload = { question, pdf_url };
    console.log("Sending payload:", payload);
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch answer from backend");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("askQuestion 함수 내부 오류:", error);
    throw error;
  }
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  askQuestion
}, Symbol.toStringTag, { value: "Module" }));
const colorPalette = [
  { hex: "#c7e372", color: "green" },
  { hex: "#ffc701", color: "yellow" },
  { hex: "#ef5a68", color: "red" },
  { hex: "#9ad0dc", color: "blue" },
  { hex: "#c683ff", color: "purple" }
];
const PDFInput = ({ onSubmit, layoutType = "inline", className }) => {
  const [selectedColor, setSelectedColor] = React.useState(colorPalette[0].hex);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("color", selectedColor);
        const pdfUrl = formData.get("pdf_url");
        localStorage.setItem("pdf_url", pdfUrl);
        onSubmit(e);
      },
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "pdf_url", className: "font-semibold text-gray-600", children: "PDF URL" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              name: "pdf_url",
              id: "pdf_url",
              required: true,
              className: "p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none",
              placeholder: "https://"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `w-full ${layoutType === "inline" ? "flex justify-between items-center" : "flex flex-col"}`, children: [
          /* @__PURE__ */ jsx("label", { className: "font-semibold text-gray-600 whitespace-nowrap", children: "Highlight" }),
          /* @__PURE__ */ jsx("div", { className: `flex items-center ${layoutType === "inline" ? "space-x-3" : "gap-2 justify-start"} flex-wrap max-w-full`, children: colorPalette.map((color) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `w-8 h-8 rounded-full border-2 transition ${selectedColor === color.hex ? "border-gray-800 scale-110" : "border-gray-300"}`,
              style: { backgroundColor: color.hex },
              onClick: () => setSelectedColor(color.hex)
            },
            color.hex
          )) })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "color", value: selectedColor }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium", children: "Upload" })
      ]
    }
  ) });
};
function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Navbar, { isMenuOpen, onMenuOpenChange: setIsMenuOpen, children: [
      /* @__PURE__ */ jsx(NavbarContent, { justify: "start", children: /* @__PURE__ */ jsx(NavbarMenuToggle, { className: "xl:hidden", "aria-label": isMenuOpen ? "Close menu" : "Open menu" }) }),
      /* @__PURE__ */ jsx(NavbarContent, { justify: "center", children: /* @__PURE__ */ jsx(NavbarBrand, { children: /* @__PURE__ */ jsx("p", { className: "font-bold text-inherit", children: "Summary AI" }) }) }),
      /* @__PURE__ */ jsx(NavbarContent, { justify: "end", children: /* @__PURE__ */ jsx(NavbarItem, { children: /* @__PURE__ */ jsx(Button, { color: "warning", href: "#", variant: "flat", children: "Logout" }) }) }),
      /* @__PURE__ */ jsx(NavbarMenu, { children: /* @__PURE__ */ jsx(NavbarMenuItem, { children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "text-xl font-bold text-center", children: " Generate New Summary" }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit(e, navigate) }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden xl:block md:w-1/5 md:h-screen md:fixed md:left-0 md:top-[4rem] md:shadow-lg md:p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-lg mb-3 font-bold text-center", children: " Generate New Summary" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit(e, navigate), layoutType: "stacked" }) })
    ] })
  ] });
}
const CollapseIcon = ({ size = 24, color = "currentColor", ...props }) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 25 25", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }),
  /* @__PURE__ */ jsx("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }),
  /* @__PURE__ */ jsxs("g", { id: "SVGRepo_iconCarrier", children: [
    " ",
    /* @__PURE__ */ jsx("path", { d: "M6 14.5L10.5 14.5V19M19 10.5H14.5L14.5 6", stroke: "#121923", "stroke-width": "1.2" }),
    " ",
    /* @__PURE__ */ jsx("path", { d: "M10.5 14.5L6 19", stroke: "#121923", "stroke-width": "1.2" }),
    " ",
    /* @__PURE__ */ jsx("path", { d: "M14.5 10.5L19 6", stroke: "#121923", "stroke-width": "1.2" }),
    " "
  ] })
] });
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
function PDFViewer({ pdfUrl, highlightedSentences, color, isFullscreen, setIsFullscreen }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pdfDoc, setPdfDoc] = useState(null);
  console.log("pdf viewer", color);
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = containerWidth / 600;
        setScale(newScale);
      }
    };
    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then((pdf) => setPdfDoc(pdf));
  }, [pdfUrl]);
  const renderPage = useCallback(
    async (page, pageIndex) => {
      const viewport = page.getViewport({ scale });
      const existingPage = document.getElementById(`pdf-page-${pageIndex}`);
      if (existingPage) existingPage.remove();
      const pageWrapper = document.createElement("div");
      pageWrapper.classList.add("page-container");
      pageWrapper.id = `pdf-page-${pageIndex}`;
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      const renderContext = { canvasContext: context, viewport };
      await page.render(renderContext).promise;
      const textContent = await page.getTextContent();
      highlightText(textContent, context, viewport, highlightedSentences);
      pageWrapper.appendChild(canvas);
      if (containerRef.current) {
        containerRef.current.appendChild(pageWrapper);
      }
    },
    [scale, highlightedSentences]
  );
  useEffect(() => {
    if (!pdfDoc) return;
    if (containerRef.current) containerRef.current.innerHTML = "";
    const renderAllPages = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        await renderPage(page, i);
      }
    };
    renderAllPages();
  }, [pdfDoc, scale, renderPage]);
  const highlightText = (textContent, context, viewport, highlightedSentences2) => {
    textContent.items.forEach((item) => {
      const normalizedText = normalizeText(item.str);
      const matchedSentence = highlightedSentences2.find(
        (h) => normalizeText(h).includes(normalizedText)
      );
      if (matchedSentence) {
        const rect = viewport.convertToViewportRectangle([
          item.transform[4],
          item.transform[5] - item.height * 0.2,
          // 🔼 적절한 높이로 조정
          item.transform[4] + item.width,
          item.transform[5] + item.height
          // 🔼 위쪽 여유 공간 추가
        ]);
        const left = Math.min(rect[0], rect[2]);
        const top = Math.min(rect[1], rect[3]);
        const minHighlightHeight = 8;
        const minHighlightWidth = 4;
        const rectWidth = Math.max(Math.abs(rect[2] - rect[0]), minHighlightWidth);
        const rectHeight = Math.max(Math.abs(rect[3] - rect[1]), minHighlightHeight);
        context.save();
        context.globalAlpha = 0.3;
        context.fillStyle = color || "rgba(255, 255, 0, 0.3)";
        context.fillRect(left, top, rectWidth, rectHeight);
        context.restore();
      }
    });
  };
  const normalizeText = (text) => text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return /* @__PURE__ */ jsxs("div", { className: `relative ${isFullscreen ? "fullscreen-mode" : "card-mode"}`, children: [
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "pdf-container" }),
    isFullscreen && /* @__PURE__ */ jsx(Tooltip, { content: "Exit Fullscreen", children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "flat",
        isIconOnly: true,
        "aria-label": "Exit FullScreen",
        color: "default",
        size: "lg",
        className: "fixed top-5 right-5 z-50",
        onPress: () => setIsFullscreen(false),
        children: /* @__PURE__ */ jsx(CollapseIcon, {})
      }
    ) })
  ] });
}
const MessageIcon = ({ fill = "currentColor", size = 24, ...props }) => {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      fill: "none",
      height: size,
      width: size,
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7l-4 4V6c0-1.1.9-2 2-2z",
          stroke: fill,
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
};
function App$1() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How Can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSend = async () => {
    if (input.trim() !== "") {
      const newMessage = { sender: "user", text: input };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");
      setIsLoading(true);
      try {
        const pdf_url = localStorage.getItem("pdf_url");
        if (!pdf_url) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "PDF URL이 없습니다. 먼저 PDF를 업로드해주세요." }
          ]);
          setIsLoading(false);
          return;
        }
        const response = await askQuestion({ question: input, pdf_url });
        if (response && response.answer) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: `${response.answer}
` }
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Unable to retreive answers." }
          ]);
        }
      } catch (error) {
        console.error("Error fetching answer:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "An error occured while retreiving an answer. Please try later" }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Tooltip, { content: "Ask AI if you have any questions", children: /* @__PURE__ */ jsx(
      Button,
      {
        isIconOnly: true,
        "aria-label": "Chat with AI",
        color: "primary",
        size: "lg",
        radius: "full",
        variant: "shadow",
        onPress: onOpen,
        className: "fixed bottom-5 left-5 z-[1100]",
        children: /* @__PURE__ */ jsx(MessageIcon, {})
      }
    ) }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        hideCloseButton: true,
        backdrop: "opaque",
        classNames: {
          base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2 rounded-medium z-[9999] fixed"
        },
        isOpen,
        onOpenChange,
        children: /* @__PURE__ */ jsx("div", { className: "z-[10001] relative", children: /* @__PURE__ */ jsx(DrawerContent, { className: "z-[10000] fixed bg-white h-[100vh] overflow-y-auto", children: (onClose) => /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DrawerHeader, { className: "absolute top-0 inset-x-0 z-[10000] flex flex-row gap-2 px-2 py-2 border-b border-default-200/50 justify-between bg-content1/50 backdrop-saturate-150 backdrop-blur-lg", children: /* @__PURE__ */ jsx(Tooltip, { content: "Close", children: /* @__PURE__ */ jsx(
            Button,
            {
              isIconOnly: true,
              className: "text-default-400",
              size: "sm",
              variant: "light",
              onPress: onClose,
              children: /* @__PURE__ */ jsx(
                "svg",
                {
                  fill: "none",
                  height: "20",
                  stroke: "currentColor",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  viewBox: "0 0 24 24",
                  width: "20",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx("path", { d: "m13 17 5-5-5-5M6 17l5-5-5-5" })
                }
              )
            }
          ) }) }),
          /* @__PURE__ */ jsxs(DrawerBody, { className: "pt-16", children: [
            /* @__PURE__ */ jsx("div", { className: "flex w-full justify-center items-center pt-4", children: /* @__PURE__ */ jsx(
              Image,
              {
                isBlurred: true,
                isZoomed: true,
                alt: "Question image",
                className: "aspect-square w-full hover:scale-110",
                height: 100,
                src: "/qna.png"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 py-4", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold leading-7", children: "Ask AI about this PDF" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-default-500", children: "AI will generate answers" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3 overflow-y-auto max-h-100 px-2", children: [
                messages.map((msg, index) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`,
                    children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `max-w-xs px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`,
                        children: msg.sender === "bot" ? /* @__PURE__ */ jsx(ReactMarkdown, { children: msg.text }) : msg.text
                      }
                    )
                  },
                  index
                )),
                isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-black flex items-center", children: [
                  /* @__PURE__ */ jsx(Spinner, { size: "sm", className: "mr-2" }),
                  " AI가 답변을 작성 중입니다..."
                ] }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(DrawerFooter, { className: "flex flex-col gap-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                className: "flex-grow mr-2",
                placeholder: "메시지를 입력하세요...",
                value: input,
                onChange: (e) => setInput(e.target.value),
                onKeyPress: (e) => e.key === "Enter" && handleSend()
              }
            ),
            /* @__PURE__ */ jsx(Button, { color: "primary", onPress: handleSend, isDisabled: isLoading, children: "전송" })
          ] }) })
        ] }) }) })
      }
    )
  ] });
}
const FileIcon = ({ fill = "currentColor", size = 24, ...props }) => {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5,
      stroke: "currentColor",
      className: "w-6 h-6 text-gray-500",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M13.5 10.5l-3 3m0-3l3 3m3-6.75a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.5-1.5m3-3l1.5-1.5a4.5 4.5 0 00-6.364-6.364l-1.5 1.5"
        }
      )
    }
  );
};
const ExpandIcon = ({ size = 24, color = "currentColor", ...props }) => (
  // https://www.svgrepo.com/svg/532508/expand-altexport const ExpandIcon = ({ size = 24, color = "currentColor", ...props }) => (
  /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsx("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }),
    /* @__PURE__ */ jsx("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    /* @__PURE__ */ jsxs("g", { id: "SVGRepo_iconCarrier", children: [
      " ",
      /* @__PURE__ */ jsx("path", { d: "M14 10L21 3M21 3H16.5M21 3V7.5M10 14L3 21M3 21H7.5M3 21L3 16.5", stroke: "#000000", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
      " "
    ] })
  ] })
);
function SummaryResultPage() {
  const location = useLocation();
  const data = location.state;
  const [isFullscreen, setIsFullscreen] = useState(false);
  if (!data) {
    return /* @__PURE__ */ jsx("div", { children: "Error: No data available" });
  }
  const { title, authors, summary, highlighted_sentences, pdf_url, color } = data;
  console.log("Received selected color : ", color);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen md:h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 -z-10 h-full w-full bg-cover bg-center",
        style: { backgroundImage: `url('https://bg.ibelick.com/')` },
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]", children: /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-zinc-400 opacity-20 blur-[100px]" }) })
      }
    ),
    /* @__PURE__ */ jsx(MenuBar, {}),
    /* @__PURE__ */ jsx(App$1, {}),
    /* @__PURE__ */ jsx("div", { className: "p-10 relative md:w-4/5 xl:ml-[20%] flex-grow md:h-[calc(100vh-80px)]\r\n                        bg-gradient-to-tl from-blue-50 to-zinc-50", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6 h-full", children: [
      /* @__PURE__ */ jsxs(Card, { className: "md:col-span-3 w-full h-full flex flex-col", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: "PDF Viewer" }),
          /* @__PURE__ */ jsx(Tooltip, { content: "View Full Screen", children: /* @__PURE__ */ jsx(
            Button,
            {
              isIconOnly: true,
              color: "default",
              variant: "ghost",
              size: "sm",
              onPress: () => setIsFullscreen(!isFullscreen),
              className: "flex items-center",
              children: isFullscreen ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(CollapseIcon, {}),
                "  ",
                "Exit Fullscreen"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(ExpandIcon, {}),
                "  "
              ] })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(CardBody, { className: "p-10 overflow-y-auto overflow-scroll", children: /* @__PURE__ */ jsx(
          PDFViewer,
          {
            pdfUrl: pdf_url,
            highlightedSentences: highlighted_sentences,
            color,
            isFullscreen,
            setIsFullscreen
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "md:col-span-2 w-full h-full flex flex-col", children: /* @__PURE__ */ jsxs(CardBody, { children: [
        /* @__PURE__ */ jsxs("div", { className: "text-md font-bold mb-4", children: [
          "Title: ",
          title || "Unknown Title"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(FileIcon, {}),
          /* @__PURE__ */ jsx(Link, { isExternal: true, showAnchorIcon: true, color: "foreground", href: pdf_url, className: "text-sm text-blue-500", children: pdf_url })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(
            Avatar,
            {
              showFallback: true,
              src: "https://images.unsplash.com/broken",
              className: "w-6 h-6"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700", children: authors.length > 0 ? authors.join(", ") : "Unknown Authors" })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Summary" }),
        /* @__PURE__ */ jsx("div", { className: "text-md", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: summary || "No summary available." }) }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Highlighted Sentences" }),
        /* @__PURE__ */ jsx("div", { className: "text-md text-gray-500", children: highlighted_sentences && highlighted_sentences.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 space-y-2", children: highlighted_sentences.map((sentence, index) => /* @__PURE__ */ jsx("li", { className: "text-gray-700 bg-yellow-200 p-1 rounded", children: sentence }, index)) }) : /* @__PURE__ */ jsx("div", { children: "No highlighted sentences available." }) })
      ] }) })
    ] }) })
  ] }) });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SummaryResultPage
}, Symbol.toStringTag, { value: "Module" }));
function Index$1() {
  return /* @__PURE__ */ jsxs("div", { className: "p-10 relative", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 -z-10 h-full w-full bg-cover bg-center",
        style: { backgroundImage: `url('https://bg.ibelick.com/')` },
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]", children: /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center h-[100vh] flex-col md:flex-row md:w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:w-2/5 text-center md:text-left mb-4 md:mb-0 px-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold py-5", children: "Generated Summary" }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Title :" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font py-5", children: "author :" }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Summary" }),
        /* @__PURE__ */ jsx("div", { className: "text-md", children: "blah blah" })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "md:w-3/5 md:ml-10 w-full h-auto", children: /* @__PURE__ */ jsx(CardBody, { className: "p-10" }) })
    ] })
  ] });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$1
}, Symbol.toStringTag, { value: "Module" }));
function SummaryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(e, navigate);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-10 relative", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 -z-10 h-full w-full bg-cover bg-center",
        style: { backgroundImage: `url('https://bg.ibelick.com/')` },
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center h-[100vh]", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-8 text-center", children: "Generate Summary" }),
      /* @__PURE__ */ jsx(Card, { className: "w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx(CardBody, { children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center h-32", children: [
        /* @__PURE__ */ jsx(Spinner, { size: "lg", color: "primary" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "ml-4 text-lg font-medium text-gray-600", children: "Processing PDF..." })
      ] }) : /* @__PURE__ */ jsx(PDFInput, { onSubmit: handleFormSubmit, layoutType: "inline" }) }) })
    ] })
  ] });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SummaryPage
}, Symbol.toStringTag, { value: "Module" }));
function App() {
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const getPasswordError = (value) => {
    if (value !== "admin") return "Failed to login";
    return null;
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    getPasswordError(data.password);
    navigate("/summary");
    return;
  };
  return (
    // md:flex-nowrap 
    /* @__PURE__ */ jsxs(
      Form,
      {
        className: "justify-center items-center space-y-4 max-w-4xl w-full",
        validationBehavior: "native",
        validationErrors: errors,
        onSubmit,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-wrap gap-4", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                size: "lg",
                isRequired: true,
                fullWidth: true,
                errorMessage: ({ validationDetails }) => {
                  if (validationDetails.valueMissing) {
                    return "Please enter your name";
                  }
                  return errors.name;
                },
                label: "Name",
                labelPlacement: "outside",
                name: "name",
                placeholder: "Enter your name"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                size: "lg",
                isRequired: true,
                fullWidth: true,
                errorMessage: ({ validationDetails }) => {
                  if (validationDetails.valueMissing) {
                    return "Please enter your email";
                  }
                  if (validationDetails.typeMismatch) {
                    return "Please enter a valid email address";
                  }
                },
                label: "Email",
                labelPlacement: "outside",
                name: "email",
                placeholder: "Enter your email",
                type: "email"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                isRequired: true,
                size: "lg",
                fullWidth: true,
                errorMessage: getPasswordError(password),
                isInvalid: getPasswordError(password) !== null,
                label: "Password",
                labelPlacement: "outside",
                name: "password",
                placeholder: "Enter your password",
                type: "password",
                value: password,
                onValueChange: setPassword
              }
            ),
            /* @__PURE__ */ jsxs(
              Select,
              {
                fullWidth: true,
                size: "lg",
                isRequired: true,
                label: "Language",
                labelPlacement: "outside",
                name: "language",
                placeholder: "Select Language",
                children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "kr", children: "Korean" }, "kr"),
                  /* @__PURE__ */ jsx(SelectItem, { value: "eng", children: "English" }, "eng"),
                  /* @__PURE__ */ jsx(SelectItem, { value: "deutsch", children: "German" }, "deutsch")
                ]
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "lg", fullWidth: true, color: "primary", type: "submit", children: "Submit" })
          ] }),
          submitted && /* @__PURE__ */ jsxs("div", { className: "text-small text-default-500 mt-4", children: [
            "Submitted data: ",
            /* @__PURE__ */ jsx("pre", { children: JSON.stringify(submitted, null, 2) })
          ] })
        ]
      }
    )
  );
}
function Index() {
  const features = [
    "Summarize long papers into concise and engaging text.",
    "Highlight Key sentences from your paper",
    "Archive all the papers you uploaded (upcoming feature)",
    "Evaluate your paper with our AI (upcoming feature)"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "p-10 relative", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 -z-10 h-full w-full bg-cover bg-center",
        style: { backgroundImage: `url('https://bg.ibelick.com/')` },
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]", children: /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center h-[100vh] flex-col md:flex-row md:w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:w-2/5 text-center md:text-left mb-4 md:mb-0 px-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold py-5", children: "PDF Summary" }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Features" }),
        features.map((feature, index) => /* @__PURE__ */ jsxs("div", { className: "text-md", children: [
          "✅ ",
          feature
        ] }, index)),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Service" }),
        /* @__PURE__ */ jsx("div", { className: "text-md", children: "Our service helps you streamline your research process by providing concise, easy-to-understand summaries of long academic papers. You can quickly highlight key sentences, manage your uploaded papers, and get insights from AI-powered evaluations (features coming soon). Whether you’re looking to save time or gain a better understanding of your research, our tool is here to support your academic journey." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "md:w-2/5 md:ml-10 w-full h-auto", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "text-center", children: /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: "Login" }) }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(CardBody, { className: "p-10", children: /* @__PURE__ */ jsx(App, {}) })
      ] })
    ] })
  ] });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CJ8PS8_M.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/index-iYw7La14.js", "/assets/index-D31RU-eE.js", "/assets/components-DiVF9Hq9.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-CUuogqyp.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/index-iYw7La14.js", "/assets/index-D31RU-eE.js", "/assets/components-DiVF9Hq9.js", "/assets/filter-props-BI6kDIQV.js", "/assets/context-BDW8WoO0.js", "/assets/useModal-CSHkx-4d.js", "/assets/GlobalConfig-BfVCAYU5.js"], "css": ["/assets/root-8AkWLCOA.css"] }, "routes/api.generate-summary": { "id": "routes/api.generate-summary", "parentId": "root", "path": "api/generate-summary", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.generate-summary-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.form-handler": { "id": "routes/api.form-handler", "parentId": "root", "path": "api/form-handler", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.form-handler-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.qa-handler": { "id": "routes/api.qa-handler", "parentId": "root", "path": "api/qa-handler", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.qa-handler-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/summary_result": { "id": "routes/summary_result", "parentId": "root", "path": "summary_result", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-qbqaaxol.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/PDFInput-Cg05PV0M.js", "/assets/index-D31RU-eE.js", "/assets/chunk-5PILOUBS-CzaVyh1B.js", "/assets/filter-props-BI6kDIQV.js", "/assets/useDialog-BrOfWzrx.js", "/assets/useModal-CSHkx-4d.js", "/assets/chunk-MQ3ILONP-CIa2LLGP.js", "/assets/context-BDW8WoO0.js", "/assets/index-iYw7La14.js"], "css": ["/assets/index-BxJvkBVK.css"] }, "routes/layout._index": { "id": "routes/layout._index", "parentId": "root", "path": "layout", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/layout._index-DLp8nacm.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/chunk-5PILOUBS-CzaVyh1B.js", "/assets/filter-props-BI6kDIQV.js"], "css": [] }, "routes/summary": { "id": "routes/summary", "parentId": "root", "path": "summary", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-2jOCaZce.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/PDFInput-Cg05PV0M.js", "/assets/index-D31RU-eE.js", "/assets/chunk-5PILOUBS-CzaVyh1B.js", "/assets/chunk-MQ3ILONP-CIa2LLGP.js", "/assets/filter-props-BI6kDIQV.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-C76JliaG.js", "imports": ["/assets/jsx-runtime-XlqKrwLw.js", "/assets/index-D31RU-eE.js", "/assets/useDialog-BrOfWzrx.js", "/assets/filter-props-BI6kDIQV.js", "/assets/chunk-5PILOUBS-CzaVyh1B.js", "/assets/context-BDW8WoO0.js", "/assets/index-iYw7La14.js", "/assets/chunk-MQ3ILONP-CIa2LLGP.js"], "css": [] } }, "url": "/assets/manifest-f14b7828.js", "version": "f14b7828" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/api.generate-summary": {
    id: "routes/api.generate-summary",
    parentId: "root",
    path: "api/generate-summary",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/api.form-handler": {
    id: "routes/api.form-handler",
    parentId: "root",
    path: "api/form-handler",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/api.qa-handler": {
    id: "routes/api.qa-handler",
    parentId: "root",
    path: "api/qa-handler",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/summary_result": {
    id: "routes/summary_result",
    parentId: "root",
    path: "summary_result",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/layout._index": {
    id: "routes/layout._index",
    parentId: "root",
    path: "layout",
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/summary": {
    id: "routes/summary",
    parentId: "root",
    path: "summary",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route7
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
