/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050508',
        surface: '#0d0d14',
        border: '#1e1e2e',
        primary: '#00d4ff', // cyan glow
        hazard: {
          critical: '#ff3a3a',
          highOrange: '#ff6b35',
          highDarkOrange: '#ff8c00',
          mediumYellow: '#ffb800',
          highOrangeDark: '#ff6b00',
          highYellow: '#e8a100',
          info: '#00d4ff',
          mediumGray: '#a0aec0'
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      keyframes: {
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'hex-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'alert-pulse': {
          '0%, 100%': { backgroundColor: 'rgba(255, 58, 58, 0.2)' },
          '50%': { backgroundColor: 'rgba(255, 58, 58, 0.6)' },
        },
        'flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0' },
        }
      },
      animation: {
        'grid-move': 'grid-move 20s linear infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'hex-spin': 'hex-spin 1s linear infinite',
        'alert-pulse': 'alert-pulse 1s ease-in-out infinite',
        'flicker': 'flicker 3s infinite',
      }
    },
  },
  plugins: [],
}
