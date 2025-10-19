import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app.vue',
    './error.vue',
    './components/**/*.{vue,js,ts,css}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './assets/css/**/*.{css,pcss,scss}',
    './assets/styles/**/*.{css,pcss,scss}'
  ],
  safelist: [
    // Global component recipes
    'chip','chip-on','chip-off','seg','seg-on','seg-off','soft-card',
    'btn','btn-secondary','btn-ghost','step-pill','badge','nav-pill',
    // Common utilities used in @apply or conditionals
    'bg-white/5','hover:bg-white/5','ring-white/10','ring-white/15','ring-white/20',
    'text-brand-ivory','text-brand-dark','bg-brand-pink','bg-brand-yellow','bg-brand-purple'
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"Bespoke Slab"', 'Georgia', 'serif'],
        slab: ['"Bespoke Slab"', 'serif'],
        // Prepend Poppins to Tailwind's default sans stack
        sans: ['Poppins', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        // Brand tokens used as utilities like bg-brand-pink, text-brand-yellow, ring-brand-purple, etc.
        brand: {
          pink:   '#FF0062',
          yellow: '#FFD808',
          purple: '#2F3061',
          navy:   '#2F3061',
          dark:   '#343434',
          ink:    '#343434',
          ivory:  '#F5F4F1',
          paper:  '#F5F4F1'
        },
        // Base ink text color (used via @apply text-ink)
        ink: '#343434',
        mint: '#00E5A0',
        mintLight: '#2CF0B7',
        mintRing: '#1ad5a6',
        sun: '#FFDA23',
        pinkLight: '#FF4F8A',
        midnight: '#124559',
        highlight: '#FAF33E',
        brandYellow: '#FFD808',
        brandPink: '#FF0062',
        pacific: '#2563EB',
        sandstone: '#F7EFE6',
        firepink: '#FF2A6D',
        // Optional brand scale(s) consumed by some utilities
        pink: {
          DEFAULT: '#FF0062',
          50: '#FFE1EE',
          100: '#FFC2DD',
          200: '#FF99C6',
          300: '#FF70AF',
          400: '#FF4797',
          500: '#FF0062',
          600: '#E73795',
          700: '#C41F7A',
          800: '#9D1961',
          900: '#7A144B'
        },
        brick: {
          50:'#FFF1E9',100:'#FFE4D6',200:'#FFC2AA',300:'#FF9A79',
          400:'#FF7A4E',500:'#FF5A1F',600:'#E04D18',700:'#C2410C',
          800:'#9A3412',900:'#7C2D12'
        }
      },
      spacing: {
        'section-y-sm': '3.5rem', // 56px
        'section-y':    '5rem',    // 80px
        'section-y-lg': '7rem'     // 112px
      },
      backgroundImage: {
        'cta-grad':'linear-gradient(90deg,#FF5A1F,#FF2A6D)',
        'accent-grad':'linear-gradient(90deg,#2563EB,#06B6D4)'
      },
      borderRadius: {
        '2xl': '1rem',
        'xxl': '1.25rem',
        'brk-outer': '16px',
        'brk-inner': '8px'
      },
      boxShadow: {
        'soft-card': '0 10px 30px -12px rgba(0,0,0,.35)',
        'soft': '0 10px 30px rgba(0,0,0,.12)',
        'card': '0 6px 18px rgba(0,0,0,.10)',
        'mint-glow': '0 0 0 3px rgba(58,229,159,0.25), 0 8px 24px rgba(58,229,159,0.15)',
        pill: '0 6px 14px rgba(52,52,52,0.2)',
        elevated: '0 14px 36px -12px rgba(0,0,0,0.22)'
      }
    }
  }
}
