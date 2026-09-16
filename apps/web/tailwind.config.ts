import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Military/tactical dark theme
        background: '#0D1117',       // near-black background
        surface: '#161B22',          // card surfaces
        'surface-2': '#21262D',      // slightly lighter surfaces
        border: '#30363D',           // subtle borders
        foreground: '#E6EDF3',       // primary text (near-white)
        muted: '#8B949E',            // muted/secondary text
        
        // Brand colours
        olive: '#4A6741',            // primary army olive green
        'olive-dark': '#3A5232',     // darker olive for hover states
        'olive-light': '#5E7E54',    // lighter olive for active states
        
        accent: '#C9A227',           // gold/amber — medals, highlights, CTAs
        'accent-dark': '#A8841D',    // darker gold for hover
        'accent-light': '#E4B84B',   // lighter gold
        
        charcoal: '#2C3E35',         // deep military green-grey
        
        // Status colours
        success: '#3FB950',
        warning: '#D29922',
        danger: '#F85149',
        info: '#58A6FF',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'var(--font-rajdhani)', 'var(--font-inter)', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-pattern': "url('/patterns/camo-overlay.png')",
        'gold-gradient': 'linear-gradient(135deg, #C9A227 0%, #E4B84B 50%, #C9A227 100%)',
        'olive-gradient': 'linear-gradient(135deg, #3A5232 0%, #4A6741 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
      },
      boxShadow: {
        'glow-olive': '0 0 20px rgba(74, 103, 65, 0.4)',
        'glow-accent': '0 0 20px rgba(201, 162, 39, 0.3)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'marquee': 'marquee 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};

export default config;
