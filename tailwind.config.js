/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: {
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED', // Official BrandsWay Purple
            700: '#6D28D9',
            800: '#5B21B6',
            900: '#4C1D95',
            950: '#2E1065',
          },
          dark: {
            950: '#090D16',
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
            500: '#64748B',
          },
          gold: {
            50: '#FCF9EE',
            100: '#F7F1D4',
            200: '#EFE1A7',
            300: '#E5CE77',
            400: '#D4AF37',
            500: '#C19B27',
            600: '#A47E18',
            700: '#7E5E10',
          },
          surface: {
            0: '#FFFFFF',
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        certificate: ['"Cinzel"', '"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 12px 24px -6px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 20px 35px -8px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'purple-glow': '0 10px 25px -5px rgba(124, 58, 237, 0.25)',
        'purple-glow-lg': '0 20px 40px -10px rgba(124, 58, 237, 0.35)',
      }
    },
  },
  plugins: [],
}
