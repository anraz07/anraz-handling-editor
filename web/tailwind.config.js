/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gta: {
          bg: 'rgba(0, 0, 0, 0.75)',
          header: 'rgba(25, 25, 25, 0.9)',
          active: 'rgba(255, 255, 255, 0.9)',
          activeText: '#000000',
          text: '#ffffff',
          accent: '#5e9ddc' // Blue accent from GTA V interactions
        }
      },
      fontFamily: {
        sans: ['"Chalet London 1960"', 'sans-serif'], // Fallback to standard sans-serif
        title: ['"Pricedown"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
