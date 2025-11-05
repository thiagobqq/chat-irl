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
        'typing-dot': 'typing 1.4s infinite ease-in-out',
        'float': 'float 20s ease-in-out infinite',        
        'fade-in': 'fadeIn 0.3s ease-in-out',
        
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { 
            transform: 'translateY(0)',
            opacity: '0.7'
          },
          '30%': { 
            transform: 'translateY(-10px)',
            opacity: '1'
          },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
          '50%': { transform: 'translate(30px, -30px)' },          
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
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