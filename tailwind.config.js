export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          500: '#6c757d',
          600: '#495057',
          800: '#2c3e50',
        },
      },
    },
  },
  plugins: ['tailwind-scrollbar-hide'],
}
