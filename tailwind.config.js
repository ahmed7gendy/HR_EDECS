/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1',
          main: '#4f46e5',
          dark: '#4338ca',
        },
        secondary: {
          light: '#f472b6',
          main: '#ec4899',
          dark: '#db2777',
        },
        accent: {
          light: '#34d399',
          main: '#10b981',
          dark: '#059669',
        },
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
} 