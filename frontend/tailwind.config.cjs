/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          darkBg: '#0f172a',    // slate-900
          darkCard: '#111827',  // gray-900
          blue: '#3b82f6',
          lightBg: '#ffffff',
          adobeRed: '#ff0000'
        }
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.12)'
      }
    }
  },
  plugins: []
};