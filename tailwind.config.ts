import type { Config } from 'tailwindcss'
export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // custom keys → classnames become: font-brand, font-sans
        brand: ['"Bespoke Slab"', 'Georgia', 'serif'],
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      colors: {
        brand: {
          bg: 'var(--brand-bg)',
          card: 'var(--brand-card)',
          text: 'var(--brand-text)',
          a1: 'var(--brand-a1)',
          a2: 'var(--brand-a2)',
          // extended brand palette for utilities like bg-brand-purple
          pink: '#FF0062',
          yellow: '#FFD808',
          purple: '#2F3061',
          paper: '#F5F4F1',
          dark: '#343434'
        },
        // Brand-aligned pink scale for utility classes like text-pink-500
        pink: {
          50: '#FFE1EE',
          100: '#FFC2DD',
          200: '#FF99C6',
          300: '#FF70AF',
          400: '#FF4797',
          500: '#FF0062', // brand pink
          600: '#E73795',
          700: '#C41F7A',
          800: '#9D1961',
          900: '#7A144B'
        },
        // Unified Briko palette
        // Windsurf tokens
        ink: '#01161E',
        mint: '#3AE59F',
        mintLight: '#34F5C7',
        mintRing: '#1ad5a6',
        brick: {
          50:'#FFF1E9',100:'#FFE4D6',200:'#FFC2AA',300:'#FF9A79',
          400:'#FF7A4E',500:'#FF5A1F',600:'#E04D18',700:'#C2410C',
          800:'#9A3412',900:'#7C2D12'
        },
        midnight:'#124559',
        highlight:'#FAF33E',
        brandYellow:'#FFD808',
        brandPink:'#FF0062',
        pacific:'#2563EB',
        sandstone:'#F7EFE6',
        firepink:'#FF2A6D'
      },
      backgroundImage: {
        'cta-grad':'linear-gradient(90deg,#FF5A1F,#FF2A6D)',
        'accent-grad':'linear-gradient(90deg,#2563EB,#06B6D4)'
      },
      borderRadius: {
        '2xl': '1rem',
        // Windsurf tokens: outer:inner = 2:1
        'brk-outer': '16px',
        'brk-inner': '8px'
      },
      boxShadow: {
        'soft-card': '0 10px 30px -12px rgba(0,0,0,.35)',
        // Windsurf soft
        'soft': '0 6px 24px rgba(0,0,0,.25)',
        // Mint glow surrounds with a subtle ring + drop shadow
        'mint-glow': '0 0 0 3px rgba(58,229,159,0.25), 0 8px 24px rgba(58,229,159,0.15)'
      }
    }
  }
}
