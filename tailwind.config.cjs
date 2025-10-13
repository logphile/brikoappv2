/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,ts}',
  ],
  safelist: ['font-slab'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink:   '#FF0062',
          yellow: '#FFD808',
          purple: '#2F3061',
          ink:    '#343434',
          paper:  '#F5F4F1',
          // aliases used in CSS
          dark:   '#343434', // = ink
          ivory:  '#F5F4F1', // = paper
        },
      },
      boxShadow: {
        soft: '0 4px 18px rgba(0,0,0,0.12)'
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        slab: ['Bespoke Slab', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
