import type { StudSize, MosaicSettings, TiledBrick } from '@/types/mosaic'

export function parseStudSize(s: string): [number, number] {
  const m = s.match(/^(\d+)x(\d+)$/)
  if (!m) throw new Error(`Invalid StudSize: ${s}`)
  return [parseInt(m[1], 10), parseInt(m[2], 10)]
}

export function sortByAreaDesc(sizes: StudSize[]): StudSize[] {
  return [...sizes].sort((a, b) => {
    const [aw, ah] = parseStudSize(a)
    const [bw, bh] = parseStudSize(b)
    const ad = (bw * bh) - (aw * ah)
    if (ad !== 0) return ad
    // tie-breaker: prefer longer max dimension
    return Math.max(bw, bh) - Math.max(aw, ah)
  })
}

export function tryFits(
  grid: Uint16Array,
  covered: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  colorId: number
): boolean {
  if (x + w > width || y + h > height) return false
  for (let dy = 0; dy < h; dy++) {
    const row = (y + dy) * width
    for (let dx = 0; dx < w; dx++) {
      const i = row + (x + dx)
      if (covered[i] || grid[i] !== colorId) return false
    }
  }
  return true
}

function mark(covered: Uint8Array, width: number, x: number, y: number, w: number, h: number) {
  for (let dy = 0; dy < h; dy++) {
    const row = (y + dy) * width
    covered.fill(1, row + x, row + x + w)
  }
}

export function greedyTileGrid(
  grid: Uint16Array,
  width: number,
  height: number,
  settings: MosaicSettings
): TiledBrick[] {
  const ordered = sortByAreaDesc(settings.allowedParts)

  // Precompute candidate dimensions honoring orientation
  const candidates: [number, number][] = []
  for (const s of ordered) {
    const [sw, sh] = parseStudSize(s)
    if (settings.snapOrientation === 'horizontal') {
      const w = Math.max(sw, sh), h = Math.min(sw, sh)
      candidates.push([w, h])
    } else if (settings.snapOrientation === 'vertical') {
      const h = Math.max(sw, sh), w = Math.min(sw, sh)
      candidates.push([w, h])
    } else {
      // both orientations
      candidates.push([sw, sh])
      if (sw !== sh) candidates.push([sh, sw])
    }
  }

  const covered = new Uint8Array(width * height)
  const out: TiledBrick[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (covered[i]) continue
      const color = grid[i]
      let placed = false
      for (let k = 0; k < candidates.length; k++) {
        const [w, h] = candidates[k]
        if (tryFits(grid, covered, width, height, x, y, w, h, color)) {
          mark(covered, width, x, y, w, h)
          out.push({ x, y, w, h, colorId: color })
          placed = true
          break
        }
      }
      if (!placed) {
        // guarantee progress
        mark(covered, width, x, y, 1, 1)
        out.push({ x, y, w: 1, h: 1, colorId: color })
      }
    }
  }
  return out
}
