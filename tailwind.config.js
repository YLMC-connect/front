/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5B7AB0",
        primaryDeep: "#47608E",
        primarySoft: "rgba(91, 122, 176, 0.14)",
        primaryTint: "#ECF0F7",
        bg: "#F6F7F2",
        surface: "#FFFFFF",
        surface2: "#FAFBF7",
        ink: "#1E2920",
        inkSoft: "rgba(30, 41, 32, 0.72)",
        inkMute: "rgba(30, 41, 32, 0.50)",
        inkHint: "rgba(30, 41, 32, 0.30)",
        line: "rgba(30, 41, 32, 0.08)",
        lineStrong: "rgba(30, 41, 32, 0.14)",
        warn: "#D2A24C",
        danger: "#C97C6E",
        success: "#6B9F5C",
      },
      borderRadius: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
        "2xl": 32,
        pill: 9999,
      },
    },
  },
  plugins: [],
};
