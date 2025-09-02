// Color distance and palette mapping
// Implements CIEDE2000 (preferred) with Euclidean RGB fallback

export type RGB = [number, number, number]

export function srgbToLab([r, g, b]: RGB): [number, number, number] {
  // sRGB -> linear
  const toLin = (v: number) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const R = toLin(r), G = toLin(g), B = toLin(b)
  // linear RGB -> XYZ (D65)
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041
  // XYZ -> Lab (D65 white)
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X / 0.95047)
  const fy = f(Y / 1.0)
  const fz = f(Z / 1.08883)
  const L = 116 * fy - 16
  const a = 500 * (fx - fy)
  const b2 = 200 * (fy - fz)
  return [L, a, b2]
}

export function deltaE76(lab1: number[], lab2: number[]): number {
  return Math.hypot(lab1[0] - lab2[0], lab1[1] - lab2[1], lab1[2] - lab2[2])
}

// CIEDE2000 per Sharma et al. (2005)
export function ciede2000(lab1: number[], lab2: number[]): number {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2

  const kL = 1, kC = 1, kH = 1

  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)

  const Cbar = (C1 + C2) / 2
  const Cbar7 = Math.pow(Cbar, 7)
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))))

  const ap1 = (1 + G) * a1
  const ap2 = (1 + G) * a2
  const Cp1 = Math.hypot(ap1, b1)
  const Cp2 = Math.hypot(ap2, b2)

  const hp = (x: number, y: number) => {
    let ang = Math.atan2(y, x) * (180 / Math.PI)
    if (ang < 0) ang += 360
    return ang
  }
  const hp1 = Cp1 === 0 ? 0 : hp(ap1, b1)
  const hp2 = Cp2 === 0 ? 0 : hp(ap2, b2)

  const dLp = L2 - L1
  const dCp = Cp2 - Cp1

  let dhp = hp2 - hp1
  if (dhp > 180) dhp -= 360
  if (dhp < -180) dhp += 360
  if (Cp1 === 0 || Cp2 === 0) dhp = 0
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * Math.PI) / 360)

  const Lbarp = (L1 + L2) / 2
  const Cbarp = (Cp1 + Cp2) / 2

  let hbarp = (hp1 + hp2) / 2
  if (Math.abs(hp1 - hp2) > 180) hbarp += (hp1 + hp2 < 360 ? 180 : -180)
  if (Cp1 === 0 || Cp2 === 0) hbarp = hp1 + hp2

  const T =
    1 -
    0.17 * Math.cos(((hbarp - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * hbarp) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hbarp + 6) * Math.PI) / 180) -
    0.20 * Math.cos(((4 * hbarp - 63) * Math.PI) / 180)

  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2))
  const Sc = 1 + 0.045 * Cbarp
  const Sh = 1 + 0.015 * Cbarp * T

  const delTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2))
  const Rc = 2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)))
  const Rt = -Rc * Math.sin((2 * delTheta * Math.PI) / 180)

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
    Math.pow(dCp / (kC * Sc), 2) +
    Math.pow(dHp / (kH * Sh), 2) +
    Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh))
  )
  return dE
}

export type PaletteEntry = { id?: number; name: string; rgb: RGB }
export type Palette = { name?: string; colors: PaletteEntry[] } | PaletteEntry[]

function normalizePalette(palette: Palette): PaletteEntry[] {
  return Array.isArray(palette) ? palette : palette.colors
}

export function nearestColorId(
  rgb: RGB,
  palette: Palette,
  mode: 'ciede2000' | 'euclid' = 'ciede2000'
): number {
  const lab = srgbToLab(rgb)
  const pal = normalizePalette(palette)
  let best = Infinity
  let k = 0
  for (let i = 0; i < pal.length; i++) {
    const d = mode === 'euclid' ? deltaE76(lab, srgbToLab(pal[i].rgb)) : ciede2000(lab, srgbToLab(pal[i].rgb))
    if (d < best) {
      best = d
      k = i
    }
  }
  return k
}

export interface MapSettings {
  dither?: 'none' | 'floyd-steinberg'
  distance?: 'ciede2000' | 'euclid'
}

export function mapBitmapToPalette(
  imageData: ImageData,
  palette: Palette,
  settings: MapSettings = {}
): Uint16Array {
  const { dither = 'none', distance = 'ciede2000' } = settings
  const pal = normalizePalette(palette)
  const out = new Uint16Array(imageData.width * imageData.height)

  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  if (dither === 'none') {
    for (let i = 0, px = 0; i < data.length; i += 4, px++) {
      out[px] = nearestColorId([data[i], data[i + 1], data[i + 2]], pal, distance)
    }
    return out
  }

  // Floyd–Steinberg dithering (serpentine)
  const buf = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) buf[i] = data[i]

  const clamp255 = (n: number) => Math.max(0, Math.min(255, n))
  const add = (x: number, y: number, er: number, eg: number, eb: number, w: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const o = (y * width + x) * 4
    buf[o] += er * w
    buf[o + 1] += eg * w
    buf[o + 2] += eb * w
  }

  for (let y = 0; y < height; y++) {
    const ltr = y % 2 === 0
    const xs = ltr ? 0 : width - 1
    const xe = ltr ? width : -1
    const step = ltr ? 1 : -1
    for (let x = xs; x !== xe; x += step) {
      const o = (y * width + x) * 4
      const sr = clamp255(buf[o])
      const sg = clamp255(buf[o + 1])
      const sb = clamp255(buf[o + 2])
      const idx = nearestColorId([sr, sg, sb], pal, distance)
      out[y * width + x] = idx
      const [cr, cg, cb] = pal[idx].rgb
      const er = sr - cr
      const eg = sg - cg
      const eb = sb - cb
      const dir = step
      add(x + dir, y, er, eg, eb, 7 / 16)
      add(x - dir, y + 1, er, eg, eb, 3 / 16)
      add(x, y + 1, er, eg, eb, 5 / 16)
      add(x + dir, y + 1, er, eg, eb, 1 / 16)
    }
  }
  return out
}
