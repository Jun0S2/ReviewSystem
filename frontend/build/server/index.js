import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useLocation } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { HeroUIProvider, Navbar, NavbarContent, NavbarMenuToggle, NavbarBrand, NavbarItem, Button, NavbarMenu, NavbarMenuItem, Card, CardHeader, Divider, CardBody, Form, Input, Select, SelectItem } from "@heroui/react";
import dotenv from "dotenv";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
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
function App$1() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App$1,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
dotenv.config();
async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");
  const baseBackendUrl = "http://localhost:8000";
  const endpoint = "/process-pdf-test";
  const backendUrl = `${baseBackendUrl}${endpoint}`;
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pdf_url })
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
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "pdf_file", className: "font-semibold text-gray-600", children: "Or Upload PDF File (Not supported yet)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              disabled: true,
              type: "file",
              name: "pdf_file",
              id: "pdf_file",
              accept: ".pdf",
              className: "p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `w-full ${layoutType === "inline" ? "flex justify-between items-center" : "flex flex-col"}`, children: [
          /* @__PURE__ */ jsx("label", { className: "font-semibold text-gray-600 whitespace-nowrap", children: "Theme" }),
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
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
function PDFViewer({ pdfUrl, highlightedSentences, color }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsFullscreen(!isFullscreen),
        className: "floating-btn",
        children: isFullscreen ? "Exit Fullscreen" : "Fullscreen"
      }
    )
  ] });
}
function SummaryResultPage() {
  const location = useLocation();
  const data = location.state;
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
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]", children: /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" }) })
      }
    ),
    /* @__PURE__ */ jsx(MenuBar, {}),
    /* @__PURE__ */ jsx("div", { className: "p-10 relative md:w-4/5 xl:ml-[20%] flex-grow md:h-[calc(100vh-80px)]", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6 h-full", children: [
      /* @__PURE__ */ jsx(Card, { className: "md:col-span-3 w-full h-full flex flex-col", children: /* @__PURE__ */ jsxs(CardBody, { className: "p-10 overflow-y-auto overflow-scroll", children: [
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mb-4", children: "PDF Viewer" }),
        /* @__PURE__ */ jsx(PDFViewer, { pdfUrl: pdf_url, highlightedSentences: highlighted_sentences, color }),
        "              "
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "md:col-span-2 w-full h-full flex flex-col", children: /* @__PURE__ */ jsxs(CardBody, { className: "p-10 overflow-scroll", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold py-5", children: "Generated Summary" }),
        /* @__PURE__ */ jsxs("div", { className: "text-md font-bold", children: [
          "Title: ",
          title || "Unknown Title"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "", children: [
          "pdf url : ",
          pdf_url,
          " "
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font", children: [
          "Authors: ",
          authors.length > 0 ? authors.join(", ") : "Unknown Authors"
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Summary" }),
        /* @__PURE__ */ jsx("div", { className: "text-md", children: summary || "No summary available." }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Highlighted Sentences" }),
        /* @__PURE__ */ jsx("div", { className: "text-md text-gray-500", children: highlighted_sentences && highlighted_sentences.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 space-y-2", children: highlighted_sentences.map((sentence, index) => /* @__PURE__ */ jsx("li", { className: "text-gray-700 bg-yellow-200 p-1 rounded", children: sentence }, index)) }) : /* @__PURE__ */ jsx("div", { children: "No highlighted sentences available." }) })
      ] }) })
    ] }) })
  ] }) });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$1
}, Symbol.toStringTag, { value: "Module" }));
function SummaryPage() {
  const navigate = useNavigate();
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
      /* @__PURE__ */ jsx(Card, { className: "w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit(e, navigate), layoutType: "inline" }) }) })
    ] })
  ] });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const newErrors = {};
    const passwordError = getPasswordError(data.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (data.name === "admin" && data.password === "admin") {
      navigate("/summary");
      return;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (data.terms !== "true") {
      setErrors({ terms: "Please accept the terms" });
      return;
    }
    setErrors({});
    setSubmitted(data);
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
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-NfEINkjJ.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-BLPPaW__.js", "/assets/index-ibzTEksl.js", "/assets/components-tRXhihAw.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-CRlSIqda.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-BLPPaW__.js", "/assets/index-ibzTEksl.js", "/assets/components-tRXhihAw.js", "/assets/filter-props-x3ph258H.js", "/assets/context-DVEV0D0Z.js", "/assets/GlobalConfig-BfVCAYU5.js"], "css": ["/assets/root-Dj8rA66w.css"] }, "routes/api.generate-summary": { "id": "routes/api.generate-summary", "parentId": "root", "path": "api/generate-summary", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.generate-summary-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.form-handler": { "id": "routes/api.form-handler", "parentId": "root", "path": "api/form-handler", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.form-handler-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/summary_result": { "id": "routes/summary_result", "parentId": "root", "path": "summary_result", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-DSAd2pE-.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/PDFInput-CwnGYMgy.js", "/assets/index-ibzTEksl.js", "/assets/chunk-5PILOUBS-3rhuKQb0.js", "/assets/filter-props-x3ph258H.js", "/assets/chunk-D5XJWRAV-TK7B16Pg.js", "/assets/index-BLPPaW__.js"], "css": ["/assets/index-BxJvkBVK.css"] }, "routes/layout._index": { "id": "routes/layout._index", "parentId": "root", "path": "layout", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/layout._index-CqYo8wUb.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/chunk-5PILOUBS-3rhuKQb0.js", "/assets/filter-props-x3ph258H.js"], "css": [] }, "routes/summary": { "id": "routes/summary", "parentId": "root", "path": "summary", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-DeliyGHO.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/PDFInput-CwnGYMgy.js", "/assets/index-ibzTEksl.js", "/assets/chunk-5PILOUBS-3rhuKQb0.js", "/assets/filter-props-x3ph258H.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-DUpp9RUo.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-ibzTEksl.js", "/assets/chunk-5PILOUBS-3rhuKQb0.js", "/assets/filter-props-x3ph258H.js", "/assets/chunk-D5XJWRAV-TK7B16Pg.js", "/assets/context-DVEV0D0Z.js", "/assets/index-BLPPaW__.js"], "css": [] } }, "url": "/assets/manifest-5ef7d9f6.js", "version": "5ef7d9f6" };
const mode = "production";
const assetsBuildDirectory = "build/client";
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
  "routes/summary_result": {
    id: "routes/summary_result",
    parentId: "root",
    path: "summary_result",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/layout._index": {
    id: "routes/layout._index",
    parentId: "root",
    path: "layout",
    index: true,
    caseSensitive: void 0,
    module: route4
  },
  "routes/summary": {
    id: "routes/summary",
    parentId: "root",
    path: "summary",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
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
