import{R as i,j as e}from"./jsx-runtime-phZAPfrw.js";const m=async(l,s)=>{l.preventDefault();const a=new FormData(l.target),t=a.get("color");console.log("selected color : ",t);try{const o=await fetch("/api/generate-summary",{method:"POST",body:a});if(!o.ok)throw new Error("Failed to fetch data from the backend");const r=await o.json();s("/summary_result",{state:{...r,color:t}})}catch(o){console.error("Error:",o),alert("An error occurred while processing the PDF.")}},n=[{hex:"#c7e372",color:"green"},{hex:"#ffc701",color:"yellow"},{hex:"#ef5a68",color:"red"},{hex:"#9ad0dc",color:"blue"},{hex:"#c683ff",color:"purple"}],f=({onSubmit:l,layoutType:s="inline",className:a})=>{const[t,o]=i.useState(n[0].hex);return e.jsx("div",{children:e.jsxs("form",{onSubmit:r=>{r.preventDefault();const c=new FormData(r.target),d=c.get("pdf_url");localStorage.setItem("pdf_url",d),c.append("color",t),l(r)},className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-col space-y-2",children:[e.jsx("label",{htmlFor:"pdf_url",className:"font-semibold text-gray-600",children:"PDF URL"}),e.jsx("input",{type:"url",name:"pdf_url",id:"pdf_url",required:!0,className:"p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none",placeholder:"https://"})]}),e.jsxs("div",{className:`w-full ${s==="inline"?"flex justify-between items-center":"flex flex-col"}`,children:[e.jsx("label",{className:"font-semibold text-gray-600 whitespace-nowrap",children:"Highlight"}),e.jsx("div",{className:`flex items-center ${s==="inline"?"space-x-3":"gap-2 justify-start"} flex-wrap max-w-full`,children:n.map(r=>e.jsx("button",{type:"button",className:`w-8 h-8 rounded-full border-2 transition ${t===r.hex?"border-gray-800 scale-110":"border-gray-300"}`,style:{backgroundColor:r.hex},onClick:()=>o(r.hex)},r.hex))})]}),e.jsx("input",{type:"hidden",name:"color",value:t}),e.jsx("button",{type:"submit",className:"w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium",children:"Upload"})]})})};export{f as P,m as h};
