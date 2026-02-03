export const theme = {
    colors: {
        primary: {
            DEFAULT: '#FF5722', // Brand Orange
            hover: '#F4511E',
            light: '#FFCCBC',
            subtle: '#FFF3E0', // Orange-50
            text: '#E64A19',
        },
        background: {
            main: '#F8FAFC', // Slate-50 (Light, clean background)
            paper: '#FFFFFF', // White
            sidebar: '#0F172A', // Slate-900 (High contrast dark sidebar)
        },
        text: {
            primary: '#0F172A', // Slate-900
            secondary: '#475569', // Slate-600
            muted: '#94A3B8', // Slate-400
            onDark: {
                primary: '#F8FAFC', // Slate-50
                secondary: '#94A3B8', // Slate-400
            }
        },
        border: {
            default: '#E2E8F0', // Slate-200
            subtle: '#F1F5F9', // Slate-100
        },
        status: {
            success: { bg: '#ECFDF5', text: '#059669', dot: '#10B981' }, // Emerald
            warning: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' }, // Amber
            error: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' }, // Red
            info: { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' }, // Blue
        }
    },
    effects: {
        glass: 'bg-white/80 backdrop-blur-md border border-slate-200/60',
        shadow: {
            sm: 'shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
            md: 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]',
            lg: 'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',
            primary: 'shadow-[0_0_20px_rgba(255,87,34,0.15)]', // Orange glow
        }
    },
    layout: {
        sidebarWidth: '16rem', // 64 / 4 = 16rem
        headerHeight: '4rem',
    }
};
