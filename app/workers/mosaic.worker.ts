import type { WorkerIn, WorkerOut, BomRow, Placement } from '@/types/mosaic'

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

// -------- plate catalog (prices are placeholders) -----------
const PARTS = [
  { part: 'Plate 2×4', w: 2, h: 4, price: 0.12 },
  { part: 'Plate 2×3', w: 2, h: 3, price: 0.10 },
  { part: 'Plate 2×2', w: 2, h: 2, price: 0.08 },
  { part: 'Plate 1×4', w: 1, h: 4, price: 0.06 },
  { part: 'Plate 1×3', w: 1, h: 3, price: 0.05 },
  { part: 'Plate 1×2', w: 1, h: 2, price: 0.04 },
  { part: 'Plate 1×1', w: 1, h: 1, price: 0.03 } // fallback
] as const

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const { type, image, width, height, palette, greedy } = e.data
  if (type !== 'process') return
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

  const bomSingles: BomRow[] = palette
    .map((p, i) => ({ color_name: p.name, hex: p.hex, part: 'Plate 1×1', unit_price: p.price_1x1, qty: counts[i] }))
    .filter(r => r.qty > 0)
    .map(r => ({ ...r, total_price: +(r.qty * r.unit_price).toFixed(2) }))

  let placements: Placement[] | undefined
  let bomGreedy: BomRow[] | undefined

  if (greedy) {
    const used = new Uint8Array(width * height)
    placements = []
    // scan top-left to bottom-right
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (used[i]) continue
        const color = indexes[i]
        // try biggest part that fits
        let placed = false
        for (const P of PARTS) {
          // try canonical orientation
          if (fits(P, x, y, width, height, used, indexes, color)) {
            place(P, x, y, width, used)
            placements.push({ x, y, w: P.w, h: P.h, color, part: P.part })
            placed = true
            break
          }
          // try rotated orientation for non-square
          if (P.w !== P.h) {
            const R = { w: P.h, h: P.w }
            if (fits(R as any, x, y, width, height, used, indexes, color)) {
              place(R as any, x, y, width, used)
              placements.push({ x, y, w: R.w, h: R.h, color, part: P.part })
              placed = true
              break
            }
          }
        }
        if (!placed) {
          // safety (shouldn't happen)
          used[i] = 1
          placements.push({ x, y, w: 1, h: 1, color, part: 'Plate 1×1' })
        }
      }
    }
    // build greedy BOM
    const map = new Map<string, BomRow>()
    for (const pl of placements) {
      const p = palette[pl.color]
      const key = `${pl.part}|${p.name}`
      const price = PARTS.find(pp => pp.part === pl.part)!.price
      const row = map.get(key) || { part: pl.part, color_name: p.name, hex: p.hex, qty: 0, unit_price: price, total_price: 0 }
      row.qty++
      map.set(key, row)
    }
    bomGreedy = Array.from(map.values()).map(r => ({ ...r, total_price: +(r.qty * r.unit_price).toFixed(2) }))
  }

  const out: WorkerOut = { width, height, palette, indexes, bomSingles, placements, bomGreedy }
  // Transfer the big typed array
  ;(self as any).postMessage(out, [out.indexes.buffer])
}

// helpers
function fits(P: { w: number; h: number }, x: number, y: number, w: number, h: number, used: Uint8Array, idx: Uint16Array, color: number) {
  if (x + P.w > w || y + P.h > h) return false
  for (let dy = 0; dy < P.h; dy++) {
    const row = (y + dy) * w
    for (let dx = 0; dx < P.w; dx++) {
      const i = row + (x + dx)
      if (used[i] || idx[i] !== color) return false
    }
  }
  return true
}
function place(P: { w: number; h: number }, x: number, y: number, w: number, used: Uint8Array) {
  for (let dy = 0; dy < P.h; dy++) {
    const row = (y + dy) * w
    used.fill(1, row + x, row + x + P.w)
  }
}
