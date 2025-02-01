import React from "react";

interface PDFInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const PDFInput: React.FC<PDFInputProps> = ({ onSubmit, className }) => {
  return (
    <div>
         {/* className={`p-6 bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}> */}
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
