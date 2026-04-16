/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'raiz-verde': '#2D5A27', // Verde escuro floresta
        'raiz-marrom': '#4B3621', // Marrom terra
        'raiz-bege': '#FDFCF0',   // Fundo levemente amarelado/papel
      },
    },
  },
  plugins: [],
}