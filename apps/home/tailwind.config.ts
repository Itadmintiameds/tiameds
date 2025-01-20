import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        primary: "var(--PRIMARY)",
        secondary: "var(--SECONDARY)",
        tertiary: "var(--TERTIARY)",
        background: "var(--BACKGROUND)",
        cardbackground: "var(--CARD-BACKGROUND)",
        cardhover: "var(--CARD-HOVER)",
        textdark: "var(--TEXT-DARK)",
        textlight: "var(--TEXT-LIGHT)",
        textmuted: "var(--TEXT-MUTED)",
        textwhite: "var(--TEXT-WHITE)",
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
      },
    },
  },
  plugins: [],
};

export default config;
