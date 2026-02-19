/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#fde8d1',
          200: '#fbd0a3',
          300: '#f8b175',
          400: '#f58d47',
          500: '#f26a19',
          600: '#d95a15',
          700: '#b64a12',
          800: '#933a0f',
          900: '#7a2f0c',
        },
        secondary: {
          50: '#faf7f2',
          100: '#f3ede0',
          200: '#e7d9c1',
          300: '#d9c4a2',
          400: '#cbaa83',
          500: '#bd9064',
          600: '#a77a56',
          700: '#8b6448',
          800: '#6f4e3a',
          900: '#5b4030',
        },
        'accent-green': {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5cc',
          300: '#8dd4a8',
          400: '#5bbd7f',
          500: '#3da665',
          600: '#2f8551',
          700: '#276a42',
          800: '#225537',
          900: '#1e472f',
        },
        'accent-gold': {
          50: '#fffbf0',
          100: '#fef6d9',
          200: '#fdebb3',
          300: '#fbd980',
          400: '#f8c24d',
          500: '#f5a623',
          600: '#d68a1a',
          700: '#b36e17',
          800: '#905718',
          900: '#77471a',
        },
        'accent-blue': {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a7f7',
          500: '#0d8aed',
          600: '#0b6ecb',
          700: '#0a57a5',
          800: '#0b4787',
          900: '#0e3d70',
        },
      },
      backgroundImage: {
        'gradient-sunrise': 'linear-gradient(135deg, #f26a19 0%, #f5a623 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f5a623 0%, #f26a19 100%)',
        'gradient-earth': 'linear-gradient(135deg, #bd9064 0%, #78716c 100%)',
        'gradient-sky': 'linear-gradient(135deg, #0d8aed 0%, #3da665 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f5a623 0%, #f8c24d 100%)',
        'gradient-green': 'linear-gradient(135deg, #3da665 0%, #5bbd7f 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f26a19 0%, #f58d47 100%)',
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'slide-in-up': 'slideInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        'slideInUp': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slideInLeft': {
          'from': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slideInRight': {
          'from': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      fontSize: {
        'responsive-xl': 'clamp(1.5rem, 4vw, 3rem)',
        'responsive-lg': 'clamp(1.125rem, 3vw, 1.5rem)',
        'responsive-md': 'clamp(1rem, 2.5vw, 1.25rem)',
      },
    },
  },
  plugins: [],
} 