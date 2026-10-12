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
        // Legacy tokens (still referenced by older, currently unmounted components)
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

        // Clinical noir — channel variables so opacity modifiers (bg-ink/5, border-edge/10…) work
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        mute: "rgb(var(--mute) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        signal: "rgb(var(--signal) / <alpha-value>)",
        "on-signal": "rgb(var(--on-signal) / <alpha-value>)",
        halo: "rgb(var(--halo) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: {
        shell: "1360px",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(.22, 1, .36, 1)",
        "in-out-soft": "cubic-bezier(.65, 0, .35, 1)",
      },
      animation: {
        'fade-in': 'fadeIn 2s ease-in',
        'fade-in-up': 'fadeInUp 1.5s ease-out',
        'slide-in': 'slideIn 1s ease-in',
        'gradient-flow': 'gradientFlow 6s ease-in-out infinite',
        'spin-slow': 'spin 80s linear infinite',
        'spin-slower': 'spin 140s linear infinite',
        caret: 'caret 1.05s steps(1, end) infinite',
        'pulse-dot': 'pulseDot 2.4s cubic-bezier(.22, 1, .36, 1) infinite',
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
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseDot: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--signal) / 0.55)' },
          '70%': { boxShadow: '0 0 0 9px rgb(var(--signal) / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(var(--signal) / 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
