import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useLocation, useFetcher } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { HeroUIProvider, Navbar, NavbarContent, NavbarMenuToggle, NavbarBrand, NavbarItem, Button, NavbarMenu, NavbarMenuItem, Card, CardHeader, Divider, CardBody, Form, Input, Select, SelectItem } from "@heroui/react";
import dotenv from "dotenv";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  try {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the backend");
    }
    const data = await response.json();
    navigate("/summary_result", { state: data });
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while processing the PDF.");
  }
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  handleSubmit
}, Symbol.toStringTag, { value: "Module" }));
const PDFInput = ({ onSubmit, className }) => {
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
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
      /* @__PURE__ */ jsx("label", { htmlFor: "pdf_file", className: "font-semibold text-gray-600", children: "Or Upload PDF File" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          name: "pdf_file",
          id: "pdf_file",
          accept: ".pdf",
          className: "p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium",
        children: "Upload"
      }
    )
  ] }) });
};
function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Navbar, { isBordered: true, isMenuOpen, onMenuOpenChange: setIsMenuOpen, children: [
      /* @__PURE__ */ jsx(NavbarContent, { justify: "start", children: /* @__PURE__ */ jsx(NavbarMenuToggle, { className: "md:hidden", "aria-label": isMenuOpen ? "Close menu" : "Open menu" }) }),
      /* @__PURE__ */ jsx(NavbarContent, { justify: "center", children: /* @__PURE__ */ jsx(NavbarBrand, { children: /* @__PURE__ */ jsx("p", { className: "font-bold text-inherit", children: "Summary AI" }) }) }),
      /* @__PURE__ */ jsx(NavbarContent, { justify: "end", children: /* @__PURE__ */ jsx(NavbarItem, { children: /* @__PURE__ */ jsx(Button, { color: "warning", href: "#", variant: "flat", children: "Logout" }) }) }),
      /* @__PURE__ */ jsx(NavbarMenu, { children: /* @__PURE__ */ jsx(NavbarMenuItem, { children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "text-xl font-bold text-center", children: " Generate New Summary" }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit(e, navigate) }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:block md:w-1/5 md:h-screen md:fixed md:left-0 md:top-[4rem] md:bg-white md:shadow-lg md:p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-lg mb-3 font-bold text-center", children: " Generate New Summary" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit(e, navigate) }) })
    ] })
  ] });
}
function SummaryResultPage() {
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return /* @__PURE__ */ jsx("div", { children: "Error: No data available" });
  }
  const { title, authors, summary, highlighted_sentences } = data;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(MenuBar, {}),
    /* @__PURE__ */ jsxs("div", { className: "p-10 relative md:w-4/5 md:ml-[20%]", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 h-full w-full bg-cover bg-center", style: { backgroundImage: `url('https://bg.ibelick.com/')` }, children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]", children: /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6", children: [
        /* @__PURE__ */ jsx(Card, { className: "md:col-span-3 w-full h-auto", children: /* @__PURE__ */ jsxs(CardBody, { className: "p-10", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mb-4", children: "Highlighted Sentences" }),
          /* @__PURE__ */ jsx("div", { className: "text-md text-gray-500", children: highlighted_sentences && highlighted_sentences.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 space-y-2", children: highlighted_sentences.map((sentence, index) => /* @__PURE__ */ jsx("li", { className: "text-gray-700", children: sentence }, index)) }) : /* @__PURE__ */ jsx("div", { children: "No highlighted sentences available." }) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "md:col-span-2 w-full h-auto", children: /* @__PURE__ */ jsxs(CardBody, { className: "p-10", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold py-5", children: "Generated Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold py-5", children: [
            "Title: ",
            title || "Unknown Title"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm font py-5", children: [
            "Authors: ",
            authors.length > 0 ? authors.join(", ") : "Unknown Authors"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold py-5", children: "Summary" }),
          /* @__PURE__ */ jsx("div", { className: "text-md", children: summary || "No summary available." })
        ] }) })
      ] })
    ] })
  ] });
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
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const handleSubmit2 = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }
      const data = await response.json();
      navigate("/summary_result", { state: data });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the PDF.");
    }
  };
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      navigate("/summary_result", { state: fetcher.data });
    }
  }, [fetcher.state, fetcher.data, navigate]);
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
      /* @__PURE__ */ jsx(Card, { className: "w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(PDFInput, { onSubmit: (e) => handleSubmit2(e) }) }) })
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
const serverManifest = { "entry": { "module": "/assets/entry.client-CK2Q56Wc.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-C_mK7mVM.js", "/assets/components-BsOMTYD6.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-hJ5LN89W.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-C_mK7mVM.js", "/assets/components-BsOMTYD6.js", "/assets/filter-props-x3ph258H.js", "/assets/context-DVEV0D0Z.js", "/assets/GlobalConfig-BfVCAYU5.js"], "css": ["/assets/root-BKbo4kki.css"] }, "routes/api.generate-summary": { "id": "routes/api.generate-summary", "parentId": "root", "path": "api/generate-summary", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.generate-summary-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.form-handler": { "id": "routes/api.form-handler", "parentId": "root", "path": "api/form-handler", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.form-handler-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/summary_result": { "id": "routes/summary_result", "parentId": "root", "path": "summary_result", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-E8YY_0hZ.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/PDFInput-Ce5v24m9.js", "/assets/index-C_mK7mVM.js", "/assets/chunk-5PILOUBS-TFWXZGTE.js", "/assets/filter-props-x3ph258H.js", "/assets/chunk-D5XJWRAV-z8JZ37lv.js"], "css": [] }, "routes/layout._index": { "id": "routes/layout._index", "parentId": "root", "path": "layout", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/layout._index-BGeI9Jtq.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/chunk-5PILOUBS-TFWXZGTE.js", "/assets/filter-props-x3ph258H.js"], "css": [] }, "routes/summary": { "id": "routes/summary", "parentId": "root", "path": "summary", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-ChSnfsBr.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/PDFInput-Ce5v24m9.js", "/assets/components-BsOMTYD6.js", "/assets/index-C_mK7mVM.js", "/assets/chunk-5PILOUBS-TFWXZGTE.js", "/assets/filter-props-x3ph258H.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-DQkXBiEI.js", "imports": ["/assets/jsx-runtime-DaIX84cV.js", "/assets/index-C_mK7mVM.js", "/assets/chunk-5PILOUBS-TFWXZGTE.js", "/assets/filter-props-x3ph258H.js", "/assets/chunk-D5XJWRAV-z8JZ37lv.js", "/assets/context-DVEV0D0Z.js"], "css": [] } }, "url": "/assets/manifest-9c8d1c5e.js", "version": "9c8d1c5e" };
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
