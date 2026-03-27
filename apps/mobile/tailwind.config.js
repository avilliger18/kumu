/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "apple-bg": "#000000",
        "apple-surface": "#1C1C1E",
        "apple-surface2": "#2C2C2E",
        "apple-border": "#38383A",
        "apple-text": "#FFFFFF",
        "apple-subtext": "#8E8E93",
        "apple-blue": "#0A84FF",
        "apple-red": "#FF453A",
        "apple-green": "#30D158",
      },
    },
  },
  plugins: [],
};
