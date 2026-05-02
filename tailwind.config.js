/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.5)' },
          '20%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
          '50%': { opacity: '1', transform: 'translateY(-15px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'bounce-fade-up': 'bounce-fade-up 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
