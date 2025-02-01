import{r as i,j as e}from"./jsx-runtime-DaIX84cV.js";import{u as n}from"./components-BsOMTYD6.js";import{u as c}from"./index-C_mK7mVM.js";import{c as m,a as u}from"./chunk-5PILOUBS-Ct20Gcaz.js";import"./filter-props-Cyr6Gzwx.js";function g(){const r=n(),t=c(),l=async s=>{s.preventDefault();const o=new FormData(s.target);try{const a=await fetch("/api/generate-summary",{method:"POST",body:o});if(!a.ok)throw new Error("Failed to fetch data from the backend");const d=await a.json();t("/summary_result",{state:d})}catch(a){console.error("Error:",a),alert("An error occurred while processing the PDF.")}};return i.useEffect(()=>{r.state==="idle"&&r.data&&t("/summary_result",{state:r.data})},[r.state,r.data,t]),e.jsxs("div",{className:"p-10 relative",children:[e.jsx("div",{className:"absolute inset-0 -z-10 h-full w-full bg-cover bg-center",style:{backgroundImage:"url('https://bg.ibelick.com/')"},children:e.jsx("div",{className:"absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"})}),e.jsxs("div",{className:"flex flex-col justify-center items-center h-[100vh]",children:[e.jsx("div",{className:"text-4xl font-bold mb-8 text-center",children:"Generate Summary"}),e.jsx(m,{className:"w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200",children:e.jsx(u,{children:e.jsxs("form",{onSubmit:l,className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-col space-y-2",children:[e.jsx("label",{htmlFor:"pdf_url",className:"font-semibold text-gray-600",children:"PDF URL"}),e.jsx("input",{type:"url",name:"pdf_url",id:"pdf_url",required:!0,className:"p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none",placeholder:"https://"})]}),e.jsxs("div",{className:"flex flex-col space-y-2",children:[e.jsx("label",{htmlFor:"pdf_file",className:"font-semibold text-gray-600",children:"Or Upload PDF File"}),e.jsx("input",{type:"file",name:"pdf_file",id:"pdf_file",accept:".pdf",className:"p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"})]}),e.jsx("button",{type:"submit",className:"w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium",children:"Upload"})]})})})]})]})}export{g as default};
