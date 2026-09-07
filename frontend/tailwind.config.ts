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
        "bg-dark": "#1B1C1F",
        "bg-panel": "#26282C",
        "bubble-sent": "#2C6BED",
        "bubble-received": "#2C2C2E",
        "text-primary": "#E4E4E6",
        "text-secondary": "#8B8E96",
        "online-green": "#4CD964",
        "unread-badge": "#2C6BED",
      },
      borderRadius: {
        bubble: "18px",
        panel: "8px",
      },
      spacing: {
        "message-gap": "4px",
        "panel-padding": "16px",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
