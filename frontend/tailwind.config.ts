import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent-blue": "#2C6BED",
        "signal-blue": "#2C6BED",
        "signal-blue-hover": "#1D5CD9",
        "bg-dark": "#1B1C1D",
        "bg-panel": "#28282A",
        "bg-hover": "#232426",
        "bubble-sent": "#2C6BED",
        "bubble-received": "#2E2E30",
        "text-primary": "#F2F2F2",
        "text-secondary": "#8E8E93",
        "online-green": "#34C759",
        "unread-badge": "#2C6BED",
        "border-subtle": "#2F3033",
      },
      borderRadius: {
        bubble: "18px",
        panel: "10px",
      },
      spacing: {
        "message-gap": "4px",
        "panel-padding": "16px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
