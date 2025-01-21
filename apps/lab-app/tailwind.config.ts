import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--PRIMARY)",
        primarylight: "var(--PRIMARY-LIGHT)",
        secondary: "var(--SECONDARY)",
        tertiary: "var(--TERTIARY)",
        background: "var(--BACKGROUND)",
        cardbackground: "var(--CARD-BACKGROUND)",
        cardhover: "var(--CARD-HOVER)",
        textdark: "var(--TEXT-DARK)",
        textlight: "var(--TEXT-LIGHT)",
        textmuted: "var(--TEXT-MUTED)",
        textwhite: "var(--TEXT-WHITE)",
        textzinc: "var(--TEXT-ZINC)",
        savebutton: "var(--SAVE-BUTTON)",
        savehover: "var(--SAVE-HOVER)",
        deletebutton: "var(--DELETE-BUTTON)",
        deletehover: "var(--DELETE-HOVER)",
        updatebutton: "var(--UPDATE-BUTTON)",
        updatehover: "var(--UPDATE-HOVER)",
      },
      animation: {
        'fade-in': 'fadeIn 2s ease-in',
        'fade-in-up': 'fadeInUp 1.5s ease-out',
        'slide-in': 'slideIn 1s ease-in',
        'gradient-flow': 'gradientFlow 6s ease-in-out infinite',
        'scroll': 'scroll 15s linear infinite', // Added scrolling animation
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require("tailwindcss-animate")
  ],
};

export default config;
