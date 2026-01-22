import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eva': {
          'dark': '#0a0a0f',
          'darker': '#050508',
          'card': '#12121a',
          'card-hover': '#1a1a25',
          'border': '#1e1e2e',
          'primary': '#00ff88',
          'primary-dim': '#00cc6a',
          'secondary': '#a855f7',
          'secondary-dim': '#8b5cf6',
          'accent': '#06b6d4',
          'danger': '#ef4444',
          'warning': '#f59e0b',
          'success': '#10b981',
          'muted': '#6b7280',
          'text': '#e5e7eb',
          'text-dim': '#9ca3af',
        }
      },
      fontFamily: {
        'mono': ['Source Code Pro', 'SF Mono', 'Fira Code', 'monospace'],
        'display': ['Ethnocentric', 'Orbitron', 'SF Pro Display', 'sans-serif'],
        'sans': ['Source Code Pro', 'SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'eva-glow': '0 0 20px rgba(0, 255, 136, 0.15)',
        'eva-glow-strong': '0 0 30px rgba(0, 255, 136, 0.25)',
        'eva-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in': 'slide-in 0.5s ease-out forwards',
        'number-flash': 'number-flash 0.6s ease-out',
        'pulse-glow-marker': 'pulse-glow-marker 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'number-flash': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-glow-marker': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.5)', opacity: '0.2' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          background: '#0a0a0f',
          foreground: '#e5e7eb',
          primary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#00ff88',
            600: '#00cc6a',
            700: '#059669',
            800: '#047857',
            900: '#065f46',
            DEFAULT: '#00ff88',
            foreground: '#000000',
          },
          secondary: {
            DEFAULT: '#a855f7',
            foreground: '#ffffff',
          },
        },
      },
    },
  })],
}
