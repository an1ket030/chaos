/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Original aliases
        bg: '#0d0d0d',
        surface: '#141414',
        elevated: '#1a1a1a',
        accent: '#C8FF00',
        'accent-dim': '#9FCC00',
        muted: '#888888',
        chaos: '#FF4444',
        gold: '#FFD700',
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        // Component aliases (dark/primary naming)
        dark: {
          DEFAULT: '#0d0d0d',
          surface: '#141414',
          elevated: '#1a1a1a',
        },
        primary: {
          DEFAULT: '#C8FF00',
          dim: '#9FCC00',
        },
        secondary: '#888888',
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'Bebas Neue', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-wheel': 'spin-wheel 4s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
        'card-flip': 'card-flip 0.8s ease-in-out forwards',
        'bid-tick': 'bid-tick 0.3s ease-out',
        'sold-slam': 'sold-slam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'chaos-overlay': 'chaos-overlay 0.4s ease-out',
        'broke-stamp': 'broke-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        'number-tick': 'number-tick 0.2s ease-out',
        'shake': 'shake 0.6s cubic-bezier(.36,.07,.19,.97)',
      },
      keyframes: {
        'spin-wheel': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1440deg)' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        'bid-tick': {
          '0%': { transform: 'scale(1.0)', color: '#C8FF00' },
          '50%': { transform: 'scale(1.2)', color: '#C8FF00' },
          '100%': { transform: 'scale(1.0)', color: '#C8FF00' },
        },
        'sold-slam': {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '70%': { transform: 'scale(1.1) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'chaos-overlay': {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(8px)' },
        },
        'broke-stamp': {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-5deg)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(200,255,0,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(200,255,0,0.8), 0 0 40px rgba(200,255,0,0.4)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'number-tick': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
