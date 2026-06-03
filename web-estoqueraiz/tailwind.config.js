/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'raiz-verde': '#2D5A27', 
        'raiz-verde-escuro': '#17351A',
        'raiz-verde-claro': '#E7F2E5',
        'raiz-marrom': '#4B3621',
        'raiz-terracota': '#9A5B31',
        'raiz-bege': '#FDFCF0',  
        'raiz-fundo': '#F7F6F1',
        'raiz-borda': '#E7E2D6',
        'raiz-card': '#FFFFFF',
      },
      boxShadow: {
        'raiz-soft': '0 18px 55px -42px rgba(75,54,33,0.45)',
        'raiz-button': '0 14px 28px -18px rgba(45,90,39,0.9)',
      },
    },
  },
  plugins: [],
}
