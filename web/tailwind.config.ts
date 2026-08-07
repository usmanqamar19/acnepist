import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': '#9CAF88',
        'sage-green-light': '#B8D4A6',
        'sage-green-dark': '#7A9370',
        'soft-blue': '#A8C5D9',
        'soft-blue-light': '#C4D9E8',
        'soft-blue-dark': '#7FA3C0',
        'cream': '#F5F1E8',
        'cream-light': '#FAF8F3',
        'cream-dark': '#E8E0D3',
      },
    },
  },
  plugins: [],
};
export default config;

