import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // Added to ensure app directory is scanned
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002B49', // Deep Institutional Blue
          hover: '#003D66',
          light: '#F0F4F8',
          dark: '#001A2E',
        },
        secondary: {
          DEFAULT: '#00875A', // Discreet Success Green
          hover: '#006C48',
          light: '#E6F3EF',
        },
        background: '#F8F9FA', // Professional off-white
        surface: '#FFFFFF',
        text: {
          primary: '#111827', // Gray-900
          secondary: '#374151', // Gray-700
          muted: '#6B7280', // Gray-500
          light: '#9CA3AF', // Gray-400
        },
        border: '#E2E8F0', // Slate-200
        success: '#059669', // Emerald-600
        warning: '#D97706', // Amber-600
        error: '#DC2626', // Red-600
        info: '#002B49', // Reusing Primary Blue for Info/Brand alignment
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem', // 2px
        DEFAULT: '0.25rem', // 4px
        'md': '0.25rem', // 4px - enforcing minimal radius
        'lg': '0.25rem', // 4px - enforcing minimal radius
        'xl': '0.375rem', // 6px
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 0 rgba(0,0,0,0.05)', // Subtle border-like shadow
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}

export default config
