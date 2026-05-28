/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C41230',
          50:  '#FEF2F4',
          100: '#FDE8EC',
          200: '#FBCCD4',
          500: '#C41230',
          600: '#A30E27',
          700: '#820B1F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
