/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core palette — dark charcoal base
        bg: {
          primary: "#1a1d23",
          secondary: "#22262e",
          tertiary: "#2a2f38",
        },
        border: {
          subtle: "#333a45",
        },
        // Accent — muted bluish-grey
        accent: {
          primary: "#6390bf",
          light: "#7da8d4",
          dark: "#4a7199",
          glow: "rgba(99, 144, 191, 0.15)",
          border: "rgba(99, 144, 191, 0.6)",
        },
        // Text hierarchy
        text: {
          primary: "#e8ecf1",
          secondary: "#9aa3b0",
          muted: "#5a6370",
        },
        // Semantic status
        status: {
          success: "#4ade80",
          pending: "#fbbf24",
          error: "#f87171",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
