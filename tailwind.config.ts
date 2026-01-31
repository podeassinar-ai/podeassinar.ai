import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5722', // Vibrant Orange
          hover: '#F4511E',
          light: '#FFCCBC',
          dark: '#E64A19',
        },
        secondary: {
          DEFAULT: '#FFFFFF', // White
          hover: '#F9FAFB',
          light: '#FFFFFF',
        },
        background: '#FFFFFF', // Pure White
        surface: '#FFFFFF',
        accent: {
          DEFAULT: '#FFAB91', // Light Orange accent
          light: '#FFF3E0', // Very light orange bg
        },
        text: {
          primary: '#111827', // Gray-900 (Stark Dark)
          secondary: '#4B5563', // Gray-600
          muted: '#9CA3AF', // Gray-400
          light: '#D1D5DB', // Gray-300
        },
        border: '#F3F4F6', // Gray-100 (Very subtle)
        success: '#10B981', // Emerald-500
        warning: '#F59E0B', // Amber-500
        error: '#EF4444', // Red-500
        info: '#3B82F6', // Blue-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem', // 6px
        DEFAULT: '0.75rem', // 12px (More rounded for "Brilliance")
        'md': '0.75rem', // 12px
        'lg': '1rem', // 16px
        'xl': '1.5rem', // 24px
        '2xl': '2rem', // 32px
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(255, 87, 34, 0.3)', // Orange Glow
        'glow-hover': '0 0 30px rgba(255, 87, 34, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
