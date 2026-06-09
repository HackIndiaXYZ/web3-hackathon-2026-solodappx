export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: "#0A0A0F", 800: "#12121A", 700: "#1A1A2E", 600: "#232340", 500: "#2A2A4A" },
        neon: { purple: "#A855F7", blue: "#3B82F6", cyan: "#06B6D4", green: "#10B981", pink: "#EC4899" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "monospace"] },
      animation: { "glow-pulse": "glow 2s ease-in-out infinite" },
      keyframes: {
        glow: { "0%,100%": { boxShadow: "0 0 20px rgba(168,85,247,0.4)" }, "50%": { boxShadow: "0 0 40px rgba(168,85,247,0.8)" } },
      },
    },
  },
  plugins: [],
};
