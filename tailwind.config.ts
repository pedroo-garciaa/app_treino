import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#7adec4",
          dark: "#5dc9b0",
          light: "#8ce0d8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
