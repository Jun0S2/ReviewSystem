import React from "react";
/**
 * @description
 * layout : 
 * 1 ) inline - for Full Screen layout (/summary.index)
 * 2 ) stacked - for Sidebar layout (/summary_result.index)
 */
interface PDFInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  layoutType?: "inline" | "stacked"; // 🔹 레이아웃 타입 추가
  className?: string;
}

const colorPalette = [
  { hex: "#c7e372" , color: "green"},
  { hex: "#ffc701" , color: "yellow"},
  { hex: "#ef5a68" , color: "red"},
  { hex: "#9ad0dc" , color: "blue"},
  { hex: "#c683ff" , color: "purple"},
];

const PDFInput: React.FC<PDFInputProps> = ({ onSubmit, layoutType = "inline", className }) => {
  const [selectedColor, setSelectedColor] = React.useState(colorPalette[0].hex);

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="pdf_url" className="font-semibold text-gray-600">PDF URL</label>
          <input
            type="url"
            name="pdf_url"
            id="pdf_url"
            required
            className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="https://"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="pdf_file" className="font-semibold text-gray-600">Or Upload PDF File (Not supported yet)</label>
          <input
            disabled
            type="file"
            name="pdf_file"
            id="pdf_file"
            accept=".pdf"
            className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 🎨 색상 선택 */}
        <div className={`w-full ${layoutType === "inline" ? "flex justify-between items-center" : "flex flex-col"}`}>
          <label className="font-semibold text-gray-600 whitespace-nowrap">Theme</label>
          {/* 사이드바에서는 gap 2, 일반화면은 3 정도가 적당함. */}
          <div
            className={`flex items-center ${
              layoutType === "inline" ? "space-x-3" : "gap-2  justify-start"
            } flex-wrap max-w-full`}
          >
            {colorPalette.map((color) => (
              <button
                key={color.hex}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition ${
                  selectedColor === color.hex ? "border-gray-800 scale-110" : "border-gray-300"
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color.hex)}
              />
            ))}
          </div>
        </div>


        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default PDFInput;
