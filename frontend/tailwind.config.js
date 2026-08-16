/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f2f8f4',
          100: '#e1f0e7',
          200: '#c4e2cf',
          300: '#97cca9',
          400: '#64af7e',
          500: '#40925c',
          600: '#307548',
          700: '#285d3b',
          800: '#234a31',
          900: '#1e3e2a',
          950: '#0d2216',
        },
        ochre: {
          50: '#fef9ee',
          100: '#fdf1d6',
          200: '#fae0aa',
          300: '#f6ca73',
          400: '#f1ad3c',
          500: '#eb9218',
          600: '#cf730e',
          700: '#ac540f',
          800: '#8c4314',
          900: '#733714',
        },
        earth: {
          50: '#f9f7f4',
          100: '#f1ede6',
          200: '#e2dacf',
          300: '#cebfb0',
          400: '#b7a08d',
          500: '#a38772',
          600: '#8c6f5a',
          700: '#725746',
          800: '#5e483b',
          900: '#4e3c33',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
