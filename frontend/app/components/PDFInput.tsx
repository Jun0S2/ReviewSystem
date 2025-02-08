import React from "react";

interface PDFInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  layoutType?: "inline" | "stacked";
  className?: string;
}

const colorPalette = [
  { hex: "#c7e372", color: "green" },
  { hex: "#ffc701", color: "yellow" },
  { hex: "#ef5a68", color: "red" },
  { hex: "#9ad0dc", color: "blue" },
  { hex: "#c683ff", color: "purple" },
];

const PDFInput: React.FC<PDFInputProps> = ({ onSubmit, layoutType = "inline", className }) => {
  const [selectedColor, setSelectedColor] = React.useState(colorPalette[0].hex);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.append("color", selectedColor); // ✅ 색상 값 추가
          onSubmit(e);
        }}
        className="space-y-4"
      >
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

        {/* <div className="flex flex-col space-y-2">
          <label htmlFor="pdf_file" className="font-semibold text-gray-600">Or Upload PDF File (Not supported yet)</label>
          <input
            disabled
            type="file"
            name="pdf_file"
            id="pdf_file"
            accept=".pdf"
            className="p-3 border rounded-md shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div> */}

        {/* 🎨 색상 선택 */}
        <div className={`w-full ${layoutType === "inline" ? "flex justify-between items-center" : "flex flex-col"}`}>
          <label className="font-semibold text-gray-600 whitespace-nowrap">Highlight</label>
          <div className={`flex items-center ${layoutType === "inline" ? "space-x-3" : "gap-2 justify-start"} flex-wrap max-w-full`}>
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

        {/* ✅ Hidden Input으로 선택한 색상 값 추가 */}
        <input type="hidden" name="color" value={selectedColor} />

        <button type="submit" className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
          Upload
        </button>
      </form>
    </div>
  );
};

export default PDFInput;
