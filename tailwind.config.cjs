/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}',
    './layouts/**/*.{vue,ts,js}',
    './plugins/**/*.{ts,js}',
  ],
  safelist: ['font-slab'],
  theme: {
    extend: {
      colors: {
        // Brand tokens
        paper: '#FFD808',   // site bg
        ink:   '#1F2342',   // dark cards/nav
        pink:  '#FF0062',   // primary accent
        plum:  '#272A52',   // optional dark alt
        // existing brand map retained for back-compat utilities
        brand: {
          pink:   '#FF0062',
          yellow: '#FFD808',
          purple: '#2F3061',
          ink:    '#343434',
          paper:  '#F5F4F1',
          dark:   '#343434',
          ivory:  '#F5F4F1',
        },
      },
      boxShadow: {
        soft: '0 4px 18px rgba(0,0,0,0.12)',
        card: '0 8px 24px -8px rgba(0,0,0,.35)',
        elevated: '0 14px 40px -10px rgba(0,0,0,.45)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        slab: ['Bespoke Slab', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
