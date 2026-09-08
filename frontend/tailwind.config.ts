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
        "bg-main": "var(--bg-main)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-card": "var(--bg-card)",
        "bg-active": "var(--bg-active)",
        "bg-hover": "var(--bg-hover)",
        "bg-pill": "var(--bg-pill)",
        "bubble-sent": "var(--bubble-sent)",
        "bubble-received": "var(--bubble-received)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "border-subtle": "var(--border-subtle)",
        "online-green": "#34C759",
        "unread-badge": "#2C6BED",
      },
      borderRadius: {
        bubble: "18px",
        panel: "14px",
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
