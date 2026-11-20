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
        background: '#F8FAFC',
        card: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F5F9',
          hover: '#F8FAFC',
          border: '#E2E8F0',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          teal: '#0284C7',
          cyan: '#0EA5E9',
          darkTeal: '#0369A1',
          amber: '#F59E0B',
          coral: '#EA580C',
          emerald: '#10B981',
          rose: '#EF4444',
          violet: '#7C3AED',
          indigo: '#4F46E5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'clean-md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'clean-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'blue-glow': '0 0 25px -4px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
