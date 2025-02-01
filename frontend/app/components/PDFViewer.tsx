import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";

// Web Worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default function PDFViewer({ pdfUrl, highlightedSentences }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      if (!containerRef.current) return;
      containerRef.current.innerHTML = ""; // 기존 내용 초기화

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        renderPage(page);
      }
    };

    const renderPage = async (page) => {
      const scale = isFullscreen ? 1.5 : 1.0;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      const renderContext = { canvasContext: context, viewport };
      await page.render(renderContext).promise;

      const textContent = await page.getTextContent();
      highlightText(textContent, context, viewport, highlightedSentences);

      if (containerRef.current) {
        const pageWrapper = document.createElement("div");
        pageWrapper.classList.add("page-container");
        pageWrapper.appendChild(canvas);
        containerRef.current.appendChild(pageWrapper);
      }
    };

    const highlightText = (textContent, context, viewport, highlightedSentences) => {
      textContent.items.forEach((item) => {
        const normalizedText = normalizeText(item.str);
        const matchedSentence = highlightedSentences.find((h) => normalizeText(h).includes(normalizedText));

        if (matchedSentence) {
          const { transform, width, height } = item;
          const [x, y] = transform.slice(4, 6);

          // 🔹 Fullscreen 시에도 위치 조정
          const adjustedX = x * viewport.scale;
          const adjustedY = (viewport.height - y) * viewport.scale - height / 2;

          console.log(`🔍 Highlighting: ${normalizedText} (Matched: ${matchedSentence})`);

          // ✅ 배경만 변경하고 텍스트는 유지
          context.save();
          context.globalAlpha = 0.4; // 투명도 조정 (텍스트가 보이도록)
          context.fillStyle = "yellow";
          context.fillRect(adjustedX, adjustedY, width * viewport.scale, height);
          context.restore();
        }
      });
    };

    const normalizeText = (text) =>
      text
        .replace(/\n/g, " ") // 개행 제거
        .replace(/\s+/g, " ") // 여러 개의 공백을 하나로
        .trim(); // 앞뒤 공백 제거

    renderPDF();
  }, [pdfUrl, highlightedSentences, isFullscreen]);

  return (
    <div className={`relative ${isFullscreen ? "fullscreen-mode" : "card-mode"}`}>
      <div ref={containerRef} className="pdf-container"></div>
      {/* ✅ Floating 버튼: 항상 화면 위에 고정 */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="floating-btn"
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
}
