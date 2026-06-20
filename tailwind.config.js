/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        editorial: {
          bg: '#fcf9ee',
          surface: '#e7d6c4',
          accent: '#ddc92a',
          text: '#141414',
        },
      },
    },
  },
  plugins: [],
};
