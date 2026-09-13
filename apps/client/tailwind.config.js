/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // DraftWar Design Tokens
        bg: '#06090E',
        surface: '#0B1017',
        elevated: '#121824',
        // Battle Crimson Brand System
        crimson: {
          DEFAULT: '#B81D1D',
          bright: '#D92525',
          dark: '#6A0C0C',
          subtle: 'rgba(184, 29, 29, 0.15)',
          glow: 'rgba(184, 29, 29, 0.45)',
        },
        // Brand aliases redirected to Battle Crimson (strictly no orange)
        fire: {
          DEFAULT: '#B81D1D',
          dim: '#8A1515',
          glow: 'rgba(184, 29, 29, 0.45)',
        },
        steel: '#3D8EFF',
        'dw-gold': {
          DEFAULT: '#E8B84B',
          glow: 'rgba(232,184,75,0.35)',
        },
        chaos: {
          DEFAULT: '#9B5DE5',
          glow: 'rgba(155,93,229,0.35)',
        },
        danger: '#D92525',
        win: '#00E599',
        // Text tokens
        muted: '#8A95A8',
        ghost: '#3A4458',
        // Legacy aliases kept for backward compat
        dark: {
          DEFAULT: '#06090E',
          surface: '#0B1017',
          elevated: '#121824',
        },
        primary: {
          DEFAULT: '#B81D1D',
          dim: '#8A1515',
          bright: '#D92525',
        },
        secondary: '#8A95A8',
        // Card tier colors
        gold: '#E8B84B',
        silver: '#8A95A8',
        bronze: '#CD7F32',
        // Editorial Paper & Ink tokens
        paper: {
          DEFAULT: '#F4EFE6',
          dark: '#E8E1D5',
        },
        ink: {
          DEFAULT: '#0B1017',
          muted: '#3D4654',
        },
        pitch: {
          DEFAULT: '#00E599',
          glow: 'rgba(0, 229, 153, 0.35)',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Barlow Condensed', 'sans-serif'],
        editorial: ['Playfair Display', 'serif'],
        syne: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'spin-wheel': 'spin-wheel 4s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
        'card-flip': 'card-flip 0.7s ease-in-out forwards',
        'bid-pulse': 'bid-pulse 0.3s ease-out',
        'sold-slam': 'sold-slam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'chaos-wash': 'chaos-wash 0.4s ease-out',
        'broke-stamp': 'broke-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.2, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.2, 0, 0.2, 1)',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        'number-tick': 'number-tick 0.2s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97)',
        'badge-pop': 'badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'spin-wheel': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1440deg)' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        'bid-pulse': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'sold-slam': {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '70%': { transform: 'scale(1.1) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-4deg)', opacity: '1' },
        },
        'chaos-wash': {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(10px)' },
        },
        'broke-stamp': {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255,107,43,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(255,107,43,0.7), 0 0 48px rgba(255,107,43,0.3)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'number-tick': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
