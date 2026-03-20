import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: "#1c1c1e",
        accent: {
          DEFAULT: "#00d6b4",
          hover: "#00b396",
        },
        card: "#ffffff",
        cardDark: "#222224",
      },
    },
  },
  plugins: [],
};
export default config;
