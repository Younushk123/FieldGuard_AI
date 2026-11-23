/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        safety: {
          orange: '#EA580C',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#EF4444',
          canvas: '#F8FAFC',
          card: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
