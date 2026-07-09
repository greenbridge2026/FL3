/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors for room statuses matching instructions
        room: {
          available: '#10b981',   // Green
          occupied: '#ef4444',    // Red
          reserved: '#f59e0b',    // Yellow
          cleaning: '#0ea5e9',    // Blue
          maintenance: '#6b7280', // Gray
        },
        // Override Indigo with Forest Emerald Green (Hotel brand primary)
        indigo: {
          50: '#f0f6f4',
          100: '#dcece5',
          200: '#bddbce',
          300: '#92c2af',
          400: '#65a58e',
          500: '#428871',
          600: '#0f523d',  // Hotel Deep Emerald
          700: '#0b3e2e',
          800: '#082d22',
          900: '#051f17',
          950: '#020d0a',
        },
        // Override Violet with Brushed Amber Gold (Hotel brand secondary / Bar theme)
        violet: {
          50: '#faf8f2',
          100: '#f3eccf',
          200: '#e7d89e',
          300: '#dac068',
          400: '#ccaa43',
          500: '#b39234',
          600: '#8c7023',  // Brushed Gold
          700: '#6b541a',
          800: '#4a3a12',
          900: '#302509',
          950: '#191204',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
