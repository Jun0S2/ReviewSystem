export const FileIcon = ({ fill = "currentColor", size = 24, ...props }) => {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 10.5l-3 3m0-3l3 3m3-6.75a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.5-1.5m3-3l1.5-1.5a4.5 4.5 0 00-6.364-6.364l-1.5 1.5"
        />
      </svg>
    );
  };
  