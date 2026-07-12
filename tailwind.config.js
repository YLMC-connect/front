const designTokens = require("./src/constants/designTokens.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      borderRadius: designTokens.radius,
    },
  },
  plugins: [],
};
