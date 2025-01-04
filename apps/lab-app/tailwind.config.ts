import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			sans: [
				"Inter",
				"ui-sans-serif",
				"system-ui",
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Arial",
				"Noto Sans",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
				"Noto Color Emoji",
			],
			serif: [
				"ui-serif",
				"Georgia",
				"Cambria",
				"Times New Roman",
				"Times",
				"serif",
			],
			mono: [
				"ui-monospace",
				"SFMono-Regular",
				"Menlo",
				"Monaco",
				"Consolas",
				"Liberation Mono",
				"Courier New",
				"monospace",
			],
		},
		extend: {
			colors: {
				'primary': 'var(--primary-color)',
				'primary-light': 'var(--primary-color-light)',
				'secondary': 'var(--primary-secondary-color-light)',

				'primary-purple': 'var(--primary-purple)',
				'secondary-purple': 'var(--secondary-purple)',
				'tertiary-purple': 'var(--tertiary-purple)',
				'quaternary-purple': 'var(--quaternary-purple)',

				'primary-text': 'var(--primary-text)',
				'secondary-text': 'var(--secondary-text)',
				'tertiary-text': 'var(--tertiary-text)',

				'button-primary': 'var(--button-primary)',
				'button-secondary': 'var(--button-secondary)',
				'button-tertiary': 'var(--button-tertiary)',
				'button-quaternary': 'var(--button-quaternary)',
				'button-danger': 'var(--button-danger)',
				'button-success': 'var(--button-success)',
				'button-warning': 'var(--button-warning)',
				'button-info': 'var(--button-info)',
				'button-saved': 'var(--button-saved)',
				'button-cancel': 'var(--button-cancel)',
			},
			backgroundImage: {
				'gradient-background': 'var(--gradient-background)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require("tailwindcss-animate")
	],
};
export default config;
