/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs': ['13px', { lineHeight: '1.25rem' }],  // was 12px
        'sm': ['15px', { lineHeight: '1.5rem'  }],  // was 14px
      },
      colors: {
        primary: {
          DEFAULT: '#C20000',
          50:  '#FFF5F5',
          100: '#FFDADA',
          200: '#FFB3B3',
          500: '#C20000',
          600: '#A10000',
          700: '#800000',
        },
        amber:   { DEFAULT: '#FEAE25', light: '#FFFADA' },
        success: { DEFAULT: '#63A363', light: '#EBF5EB' },
        info:    { DEFAULT: '#0088FF', light: '#E6F3FF' },
      },
      fontFamily: {
        sans: ['Funnel Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
