/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0E0E0F',
        'bg-elevated': '#1A1B1D',
        border: '#2C2D30',
        accent: '#FFB248',
        success: '#27C192',
        danger: '#FF5160',
        highlight: '#725AF0',
      },
      borderRadius: {
        brand: '6px',
      },
      boxShadow: {
        brand: '0 4px 12px rgba(0,0,0,.40)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
