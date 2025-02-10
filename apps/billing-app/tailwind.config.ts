
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
        customPurple: '#180029',
        customWine: '#550836',
        customWhite: '#F3E3F8',
        buttonGray: '#898384',
        buttonPurple: '#4B0082',
        inputBorder: '#4B0082',
        textField:'#898384',
        tableHeader:'#180029',
        customGreen: '#1C7631',
        tableBorder:'#B5B3B3',
        softPink: '#F3ECF8',
        lightGray: '#F2F2F2',
        buttonBorder: '#CCCBCB',
        buttonRed: '#B30000',
        buttonWarning: '#FED0AB',
        colorWarning: '#B05003',
        colorSuccess:'#1C7631',

      },
      width: {
        '47': '47.5rem',
        '35': '35rem',
        '19': '19rem',
        '32': '32rem',
        '38': '38rem',
        '25': '25rem',
        '42': '42.5rem',
        '50': '50rem',

      },
      height: {
        '27': '27rem',

      },
    },
  },
  plugins: [],
};
export default config;
