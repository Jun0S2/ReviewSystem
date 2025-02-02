import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";

// pdf.js Worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default function PDFViewer({ pdfUrl, highlightedSentences }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState(null);

  // 📌 Parent Card의 width를 감지하여 scale 자동 조정
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = containerWidth / 600; // 800은 기본 PDF 너비 (조정 가능)
        setScale(newScale);
      }
    };

    // 초기 설정
    updateScale();

    // Resize Observer를 사용하여 Parent Card 크기 변경 감지
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

  // PDF 문서 로드 (한 번만 실행)
  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then((pdf) => setPdfDoc(pdf));
  }, [pdfUrl]);

  // 페이지 렌더링 함수
  const renderPage = useCallback(
    async (page, pageIndex) => {
      const viewport = page.getViewport({ scale });

      // 기존 페이지 삭제 (중복 방지)
      const existingPage = document.getElementById(`pdf-page-${pageIndex}`);
      if (existingPage) existingPage.remove();

      const pageWrapper = document.createElement("div");
      pageWrapper.classList.add("page-container");
      pageWrapper.id = `pdf-page-${pageIndex}`;

      // PDF 페이지를 Canvas에 렌더링
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");

      const renderContext = { canvasContext: context, viewport };
      await page.render(renderContext).promise;

      // 하이라이팅 적용
      const textContent = await page.getTextContent();
      highlightText(textContent, context, viewport, highlightedSentences);

      pageWrapper.appendChild(canvas);
      if (containerRef.current) {
        containerRef.current.appendChild(pageWrapper);
      }
    },
    [scale, highlightedSentences]
  );

  // PDF 렌더링 함수
  useEffect(() => {
    if (!pdfDoc) return;
    if (containerRef.current) containerRef.current.innerHTML = ""; // 기존 페이지 삭제

    const renderAllPages = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        await renderPage(page, i);
      }
    };

    renderAllPages();
  }, [pdfDoc, scale, renderPage]);

  // 하이라이팅 적용 함수
  const highlightText = (textContent, context, viewport, highlightedSentences) => {
    textContent.items.forEach((item) => {
      const normalizedText = normalizeText(item.str);
      const matchedSentence = highlightedSentences.find((h) =>
        normalizeText(h).includes(normalizedText)
      );

      if (matchedSentence) {
        const rect = viewport.convertToViewportRectangle([
          item.transform[4],
          item.transform[5] - item.height,
          item.transform[4] + item.width,
          item.transform[5],
        ]);
        const left = Math.min(rect[0], rect[2]);
        const top = Math.min(rect[1], rect[3]);
        const rectWidth = Math.abs(rect[2] - rect[0]);
        const rectHeight = Math.abs(rect[3] - rect[1]);

        context.save();
        context.globalAlpha = 0.3;
        context.fillStyle = "rgba(255, 255, 0, 0.3)";
        context.fillRect(left, top, rectWidth, rectHeight);
        context.restore();
      }
    });
  };

  const normalizeText = (text) =>
    text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  return (
    <div className={`relative ${isFullscreen ? "fullscreen-mode" : "card-mode"}`}>
      <div ref={containerRef} className="pdf-container"></div>
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="floating-btn"
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
}
