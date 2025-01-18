const { heroui } = require("@heroui/react");

import type { Config } from "tailwindcss";

export default {
  content: [
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
"./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"
],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()]
} satisfies Config
