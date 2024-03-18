/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xls: "460px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        "piel": "#e5e5e5",
        "azul": "rgb(47 96 145)",
      },
    },
  },
  plugins: [],
};

