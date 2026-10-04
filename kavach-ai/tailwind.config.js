/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: {
          50:  '#fdfbf6',
          100: '#faf7ee',
          200: '#f3ecde',
          300: '#e9dec7',
          400: '#d6c6a3',
        },
        ink: {
          950: '#070a0f',
          900: '#0f1319',
          800: '#1a1f28',
          700: '#2a2f3a',
          600: '#3f4553',
          500: '#525a6c',
          400: '#7a8294',
          300: '#a2a9b8',
          200: '#cfd3dc',
          100: '#e7eaf0',
        },
        amber2: {
          400: '#e3a634',
          500: '#d9951f',
          600: '#b8781a',
          700: '#8f5c15',
        },
        rust: {
          500: '#c1372b',
          600: '#9f2b22',
          700: '#7a2019',
        },
        moss: {
          500: '#3d8c69',
          600: '#2d6d50',
          700: '#20533c',
        },
        deepwater: {
          500: '#2d4870',
          600: '#20355a',
          700: '#172747',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,19,25,0.04), 0 10px 28px -14px rgba(15,19,25,0.14)',
        raised: '0 2px 6px rgba(15,19,25,0.06), 0 24px 48px -24px rgba(15,19,25,0.22)',
        glow: '0 0 0 1px rgba(217,149,31,0.3), 0 20px 60px -20px rgba(217,149,31,0.3)',
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(15,19,25,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,19,25,0.045) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
