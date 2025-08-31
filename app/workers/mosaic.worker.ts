import type { WorkerIn, WorkerOut, PaletteColor, BomRow } from '@/types/mosaic'

// --- sRGB -> Lab (fast-ish dE76 for MVP) ---
function srgbToLab([r, g, b]: number[]) {
  // sRGB -> linear
  const a = [r, g, b].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
  // linear -> XYZ (D65)
  const [R, G, B] = a
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041
  // XYZ -> Lab
  const xr = X / 0.95047, yr = Y / 1.00000, zr = Z / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(xr), fy = f(yr), fz = f(zr)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
function dE76(a: number[], b: number[]) { // Euclidean in Lab
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

function nearestIndex(lab: number[], palLab: number[][]) {
  let k = 0, best = 1e9
  for (let i = 0; i < palLab.length; i++) {
    const d = dE76(lab, palLab[i]); if (d < best) { best = d; k = i }
  }
  return k
}

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const { image, width, height, palette } = e.data
  // Draw into offscreen canvas at target size
  const oc = new OffscreenCanvas(width, height)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0, width, height)
  const { data } = ctx.getImageData(0, 0, width, height)

  const palLab = palette.map(p => srgbToLab(p.rgb))
  const indexes = new Uint16Array(width * height)
  const counts = new Uint32Array(palette.length)

  for (let i = 0, px = 0; i < data.length; i += 4, px++) {
    const lab = srgbToLab([data[i], data[i + 1], data[i + 2]])
    const idx = nearestIndex(lab, palLab)
    indexes[px] = idx; counts[idx]++
  }

  const bom: BomRow[] = palette
    .map((p, i) => ({ color_name: p.name, hex: p.hex, part: 'Plate 1×1' as const, unit_price: p.price_1x1, qty: counts[i] }))
    .filter(r => r.qty > 0)
    .map(r => ({ ...r, total_price: +(r.qty * r.unit_price).toFixed(2) }))

  const out: WorkerOut = { width, height, palette, indexes, bom }
  // Transfer the big typed array
  ;(self as any).postMessage(out, [out.indexes.buffer])
}
