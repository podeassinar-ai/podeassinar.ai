import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4B4B',
          hover: '#FF6B6B',
          light: '#FFE8E8',
        },
        background: '#F0F2F6',
        surface: '#FFFFFF',
        text: {
          primary: '#262730',
          secondary: '#555867',
          muted: '#8A8D9B',
        },
        border: '#E0E2E9',
        success: '#21C354',
        warning: '#FACA15',
        error: '#FF4B4B',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
