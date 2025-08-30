import type { Config } from 'tailwindcss'
export default <Partial<Config>>{
  content: ['./app/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'var(--brand-bg)',
          card: 'var(--brand-card)',
          text: 'var(--brand-text)',
          a1: 'var(--brand-a1)',
          a2: 'var(--brand-a2)'
        }
      },
      borderRadius: { '2xl': '1rem' }
    }
  }
}
