/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#111111',
          800: '#1d1d1d',
          700: '#2b2b2b',
          600: '#4a4a4a',
          500: '#6e6e6e',
          400: '#9a9a9a',
          300: '#c4c4c4',
          200: '#dcd9d2',
          100: '#eceae3',
        },
        paper: {
          0: '#ffffff',
          50: '#faf9f5',
          100: '#f4f2ea',
          200: '#ece9df',
        },
      },
      fontFamily: {
        d: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        t: ['"EB Garamond"', 'Georgia', 'serif'],
        ui: ['Archivo', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '3px',
        none: '0',
        sm: '2px',
        md: '3px',
        pill: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(17,17,17,.05)',
        sm: '0 1px 3px rgba(17,17,17,.07),0 1px 1px rgba(17,17,17,.04)',
        md: '0 4px 14px rgba(17,17,17,.08)',
        lg: '0 14px 38px rgba(17,17,17,.12)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '360ms',
      },
      transitionTimingFunction: {
        'out-tc': 'cubic-bezier(0.16,1,0.3,1)',
        std: 'cubic-bezier(0.4,0,0.2,1)',
      },
      letterSpacing: {
        'wide-xl': '0.22em',
        'wide-lg': '0.18em',
        'wide-md': '0.14em',
        'wide-sm': '0.10em',
        'wide-xs': '0.06em',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}

