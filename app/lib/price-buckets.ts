export type PriceBucket = 'common' | 'uncommon' | 'rare'

// Multipliers applied to base part prices depending on color availability
export const PRICE_BUCKET_MULTIPLIER: Record<PriceBucket, number> = {
  common: 1.0,
  uncommon: 1.25,
  rare: 1.5
}

// Explicit lists tailored to our current legoPalette names
const COMMON_COLORS = new Set([
  'Black','White','Light Bluish Gray','Dark Bluish Gray',
  'Red','Blue','Green','Yellow','Orange',
  'Tan','Dark Tan'
])
const UNCOMMON_COLORS = new Set([
  'Light Nougat','Medium Nougat','Reddish Brown',
  'Dark Orange','Dark Red','Dark Blue',
  'Sand Green','Sand Blue','Bright Light Blue','Bright Pink'
])
const RARE_COLORS = new Set([
  'Dark Brown'
])

export function classifyBucket(colorName: string): PriceBucket {
  const name = (colorName || '').trim()
  if (RARE_COLORS.has(name)) return 'rare'
  if (UNCOMMON_COLORS.has(name)) return 'uncommon'
  if (COMMON_COLORS.has(name)) return 'common'
  // Heuristic fallback by keywords
  if (/gray|grey|black|white|red|blue|green|yellow|orange|tan/i.test(name)) return 'common'
  if (/nougat|sand|bright|pink|dark (orange|red|blue)/i.test(name)) return 'uncommon'
  return 'common'
}

export function multiplierForBucket(bucket: PriceBucket): number {
  return PRICE_BUCKET_MULTIPLIER[bucket]
}

export function multiplierForColorName(colorName: string): number {
  return multiplierForBucket(classifyBucket(colorName))
}
