import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          50: "#f5f0ff",
          100: "#ede0ff",
          200: "#d9bfff",
          300: "#be93ff",
          400: "#9f5cff",
          500: "#8b2dff",
          600: "#7b09ff",
          700: "#6900eb",
          800: "#5700bf",
          900: "#47009c",
          950: "#2c006a",
        },
        gold: {
          400: "#f5cc49",
          500: "#e8b824",
          600: "#c99a10",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      animation: {
        "card-flip": "cardFlip 0.6s ease-in-out",
        "shuffle-1": "shuffle1 0.4s ease-in-out",
        "shuffle-2": "shuffle2 0.4s ease-in-out 0.2s",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        shuffle1: {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "50%": { transform: "translateX(-40px) rotate(-5deg)" },
          "100%": { transform: "translateX(0) rotate(0deg)" },
        },
        shuffle2: {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "50%": { transform: "translateX(40px) rotate(5deg)" },
          "100%": { transform: "translateX(0) rotate(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(139, 45, 255, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(139, 45, 255, 0.8)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
