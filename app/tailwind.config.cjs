/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // New brand tokens (use utilities like bg-brand-pink, text-brand-yellow, ring-brand-purple)
        brand: {
          pink:   '#FF0062',
          yellow: '#FFD808',
          purple: '#2F3061',
          dark:   '#343434',
          ivory:  '#F5F4F1',
        },
        // Legacy flat tokens kept for compatibility
        yellow: '#FFD808',
        pink:   '#FF0062',
        purple: '#2F3061',
        ink:    '#343434',
        ivory:  '#F5F4F1',
      },
      boxShadow: {
        soft: '0 6px 30px rgba(0,0,0,.08)',
        lift: '0 8px 24px rgba(0,0,0,.14)',
      },
    },
  },
  plugins: [],
}
