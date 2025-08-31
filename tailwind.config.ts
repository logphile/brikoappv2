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
        brick: {
          50:'#FFF1E9',100:'#FFE4D6',200:'#FFC2AA',300:'#FF9A79',
          400:'#FF7A4E',500:'#FF5A1F',600:'#E04D18',700:'#C2410C',
          800:'#9A3412',900:'#7C2D12'
        },
        midnight:'#0B0F19',
        pacific:'#2563EB',
        mint:'#2DD4BF',
        sandstone:'#F7EFE6',
        firepink:'#FF2A6D'
      },
      backgroundImage: {
        'cta-grad':'linear-gradient(90deg,#FF5A1F,#FF2A6D)',
        'accent-grad':'linear-gradient(90deg,#2563EB,#06B6D4)'
      },
      borderRadius: { '2xl': '1rem' }
    }
  }
}
