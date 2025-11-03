/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      colors: {
        'primary': '#007AFF',
        'secondary': '#5856D6',
        'snow-blue': 'rgba(240, 244, 248, 0.8)',
        'resort-card': 'rgba(255, 255, 255, 0.8)',
        'text': {
          primary: '#1D1D1F',
          secondary: '#86868B',
          blue: '#007AFF'
        },
        // Dark theme colors
        'dark': {
          bg: '#000000',
          card: 'rgba(28, 28, 30, 0.8)',
          'snow-blue': 'rgba(28, 28, 30, 0.8)',
          text: {
            primary: '#F2F2F7',
            secondary: '#8E8E93',
            blue: '#0A84FF'
          }
        }
      },
      backdropBlur: {
        'md': '20px',
      }
    },
  },
  plugins: [],
}