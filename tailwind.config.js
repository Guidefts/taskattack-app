/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#1A1A1A',
        surface: '#2C2C2E',
        primary: '#EF442D',
        secondary: '#32D74B',
      },
      maxWidth: {
        '3xl': '50rem',
      },
    },
  },
  plugins: [],
};