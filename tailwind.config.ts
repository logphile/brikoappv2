import type { Config } from 'tailwindcss'
export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'var(--brand-bg)',
          card: 'var(--brand-card)',
          text: 'var(--brand-text)',
          a1: 'var(--brand-a1)',
          a2: 'var(--brand-a2)'
        },
        // Unified Briko palette
        // Windsurf tokens
        ink: '#111827',
        mint: '#00E5A0',
        mintLight: '#4ff0c8',
        mintRing: '#1ad5a6',
        brick: {
          50:'#FFF1E9',100:'#FFE4D6',200:'#FFC2AA',300:'#FF9A79',
          400:'#FF7A4E',500:'#FF5A1F',600:'#E04D18',700:'#C2410C',
          800:'#9A3412',900:'#7C2D12'
        },
        midnight:'#0B0F19',
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
        'mint-glow': '0 0 0 3px rgba(32,227,178,0.25), 0 8px 24px rgba(32,227,178,0.15)'
      }
    }
  }
}
