/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'segoe': ['"Segoe UI"', 'Verdana', 'Arial', 'sans-serif'],
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' },
        }
      },
      boxShadow: {
        'xp-button': '0 1px 0 rgba(255, 255, 255, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'xp-button-hover': '0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'xp-button-active': 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
        'xp-window': '0 0 0 1px rgba(0, 120, 215, 0.8), 0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'status': '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}