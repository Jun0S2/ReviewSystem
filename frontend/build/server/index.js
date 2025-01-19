import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useFetcher } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { HeroUIProvider, Form, Input, Select, SelectItem, Button, Card, CardHeader, Divider, CardBody } from "@heroui/react";
import dotenv from "dotenv";
import React from "react";
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
      BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000"
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
async function action$1({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/generate-summary";
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
  return response.json();
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
dotenv.config();
async function action({ request }) {
  const formData = await request.formData();
  const pdf_url = formData.get("pdf_url");
  const prompt = formData.get("prompt");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000//generate-summary";
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pdf_url, prompt })
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }
  return response.json();
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
function SummaryPage() {
  const fetcher = useFetcher();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetcher.submit(formData, { method: "post", action: "/api/generate-summary" });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Generate Highlighted Sentences and Summary" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("label", { children: [
        "PDF URL:",
        /* @__PURE__ */ jsx("input", { type: "url", name: "pdf_url", required: true })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", children: "Generate" })
    ] }),
    fetcher.data && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: "Highlighted Sentences:" }),
      /* @__PURE__ */ jsx("ul", { children: fetcher.data.highlighted_sentences.map((sentence, index) => /* @__PURE__ */ jsx("li", { children: sentence }, index)) }),
      /* @__PURE__ */ jsx("h2", { children: "Summary:" }),
      /* @__PURE__ */ jsx("p", { children: fetcher.data.summary })
    ] })
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CAGeryr7.js", "imports": ["/assets/index-dcywsMd4.js", "/assets/components-qwzCP8Jy.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DKn9lBbV.js", "imports": ["/assets/index-dcywsMd4.js", "/assets/components-qwzCP8Jy.js", "/assets/filter-props-DXSZD5UK.js", "/assets/GlobalConfig-BfVCAYU5.js"], "css": ["/assets/root-99JHfk4Z.css"] }, "routes/api.generate-summary": { "id": "routes/api.generate-summary", "parentId": "root", "path": "api/generate-summary", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.generate-summary-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.summarize": { "id": "routes/api.summarize", "parentId": "root", "path": "api/summarize", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.summarize-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/summary": { "id": "routes/summary", "parentId": "root", "path": "summary", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/index-BQud0Bxv.js", "imports": ["/assets/index-dcywsMd4.js", "/assets/components-qwzCP8Jy.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-1LbWYyZ5.js", "imports": ["/assets/_index-CaLBXJLj.js", "/assets/index-dcywsMd4.js", "/assets/filter-props-DXSZD5UK.js"], "css": [] } }, "url": "/assets/manifest-a358312c.js", "version": "a358312c" };
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
  "routes/api.summarize": {
    id: "routes/api.summarize",
    parentId: "root",
    path: "api/summarize",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/summary": {
    id: "routes/summary",
    parentId: "root",
    path: "summary",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route4
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
