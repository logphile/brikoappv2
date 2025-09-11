// legoPalette.ts
// Drop-in LEGO-like palette + nearest-color utilities (OKLab distance).
// No deps. Works in Nuxt/Vite/TS. Exported helpers cover both 3D coloring and UI swatches.

export type LegoColor = { name: string; hex: number }

// Curated set (~26) of familiar brick shades (sRGB hex). Order doesn't matter.
export const LEGO_PALETTE: LegoColor[] = [
  { name: 'White',               hex: 0xFFFFFF },
  { name: 'Black',               hex: 0x1B2A34 }, // slightly lifted from pure black for visibility
  { name: 'Light Bluish Gray',   hex: 0x9BA19D },
  { name: 'Dark Bluish Gray',    hex: 0x6D6E5C },
  { name: 'Red',                 hex: 0xC91A09 },
  { name: 'Dark Red',            hex: 0x7A0E0B },
  { name: 'Blue',                hex: 0x1E5AA8 },
  { name: 'Dark Blue',           hex: 0x0B326E },
  { name: 'Bright Light Blue',   hex: 0x6CC5F4 },
  { name: 'Green',               hex: 0x00923D },
  { name: 'Bright Green',        hex: 0x00A85A },
  { name: 'Sand Green',          hex: 0xA3B4A2 },
  { name: 'Yellow',              hex: 0xF2CD37 },
  { name: 'Bright Light Yellow', hex: 0xFFF07D },
  { name: 'Orange',              hex: 0xFF8024 },
  { name: 'Dark Orange',         hex: 0xA5581B },
  { name: 'Tan',                 hex: 0xE4CD9E },
  { name: 'Dark Tan',            hex: 0xB7A06A },
  { name: 'Brown',               hex: 0x583927 },
  { name: 'Reddish Brown',       hex: 0x5A3D2E },
  { name: 'Nougat/Medium Flesh', hex: 0xCC8E69 },
  { name: 'Dark Flesh',          hex: 0xA06D45 },
  { name: 'Purple',              hex: 0x923978 },
  { name: 'Magenta',             hex: 0xC428A1 },
  { name: 'Pink',                hex: 0xF4A9C4 },
  { name: 'Lime',                hex: 0xB6D532 },
]

// ------------------------ Color math (OKLab) ------------------------
// Source: OKLab spec (Björn Ottosson). Implemented compactly for perf/clarity.

function srgbToLinear(c: number): number {
  // c in [0..1]
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function hexToSRGB01(hex: number): [number, number, number] {
  const r = ((hex >> 16) & 255) / 255
  const g = ((hex >> 8) & 255) / 255
  const b = (hex & 255) / 255
  return [r, g, b]
}

function srgbHexToLinearRGB(hex: number): [number, number, number] {
  const [r, g, b] = hexToSRGB01(hex)
  return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]
}

function linearRGBToOKLab(r: number, g: number, b: number): [number, number, number] {
  // M1 * [r g b]
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l = Math.cbrt(l_)
  const m = Math.cbrt(m_)
  const s = Math.cbrt(s_)

  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  return [L, a, b2]
}

export type OKLab = [number, number, number]

function hexToOKLab(hex: number): OKLab {
  const [r, g, b] = srgbHexToLinearRGB(hex)
  return linearRGBToOKLab(r, g, b)
}

function oklabDist2(a: OKLab, b: OKLab): number {
  const dL = a[0] - b[0]
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return dL * dL + da * da + db * db
}

// Precompute palette in OKLab for speed.
const PALETTE_OKLAB: { lab: OKLab; color: LegoColor }[] = LEGO_PALETTE.map(c => ({
  lab: hexToOKLab(c.hex),
  color: c,
}))

// ------------------------ Public API ------------------------

/** Return index of nearest LEGO color by OKLab distance. */
export function nearestColorIndex(hex: number): number {
  const lab = hexToOKLab(hex)
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < PALETTE_OKLAB.length; i++) {
    const d = oklabDist2(lab, PALETTE_OKLAB[i].lab)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Return the nearest LEGO color object (name + hex). */
export function nearestColor(hex: number): LegoColor {
  return PALETTE_OKLAB[nearestColorIndex(hex)].color
}

/** Map an array of sRGB hex pixels to palette indices; also returns usage counts. */
export function mapPixelsToPalette(
  pixelsHex: Uint32Array, // e.g., packed 0xRRGGBB per pixel
): { indices: Uint16Array; counts: Uint32Array } {
  const n = pixelsHex.length
  const indices = new Uint16Array(n)
  const counts = new Uint32Array(LEGO_PALETTE.length)
  for (let i = 0; i < n; i++) {
    const idx = nearestColorIndex(pixelsHex[i] & 0xFFFFFF)
    indices[i] = idx
    counts[idx]++
  }
  return { indices, counts }
}

/** Utility to get a THREE.Color-friendly normalized rgb from a palette index. */
export function paletteIndexToThreeColor(idx: number): { r: number; g: number; b: number } {
  const hex = LEGO_PALETTE[idx].hex & 0xFFFFFF
  return {
    r: ((hex >> 16) & 255) / 255,
    g: ((hex >> 8) & 255) / 255,
    b: (hex & 255) / 255,
  }
}
