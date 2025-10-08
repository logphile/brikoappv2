/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
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
