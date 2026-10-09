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
        background: '#0B0F19',
        surface: {
          DEFAULT: '#111827',
          elevated: '#1F2937',
          hover: '#374151',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          teal: '#06B6D4',
          cyan: '#22D3EE',
          darkTeal: '#0E7490',
          amber: '#F59E0B',
          coral: '#F97316',
          emerald: '#10B981',
          rose: '#F43F5E',
          violet: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'surface-card': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      }
    },
  },
  plugins: [],
}
