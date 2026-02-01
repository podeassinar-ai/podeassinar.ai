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
        border: '#E5E7EB', // Gray-200 (More visible for tech borders)
        success: '#10B981', // Emerald-500
        warning: '#F59E0B', // Amber-500
        error: '#EF4444', // Red-500
        info: '#3B82F6', // Blue-500
        tech: {
          dark: '#1E293B', // Slate-800
          code: '#0F172A', // Slate-900
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'], // Added Tech fonts
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem', // 4px
        DEFAULT: '0.5rem', // 8px (Sharper than Brilliance, but still modern)
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
        'glow': '0 0 20px rgba(255, 87, 34, 0.2)', // Orange Glow
        'glow-hover': '0 0 30px rgba(255, 87, 34, 0.4)',
        'tech': '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}

export default config
