import type { ZBrickSizeT as BrickSize } from '@/types/mosaic'

export interface Tile { x: number; y: number; w: number; h: number; colorId: number }

export function greedyTile(
  paletteIds: Uint16Array,
  width: number,
  height: number,
  sizes: BrickSize[]
): Tile[] {
  // Try sizes largest->smallest
  const ordered = [...sizes].sort((a, b) => b[0] * b[1] - a[0] * a[1])
  const used = new Uint8Array(width * height)
  const tiles: Tile[] = []

  const fits = (sx: number, sy: number, sw: number, sh: number, color: number) => {
    if (sx + sw > width || sy + sh > height) return false
    for (let dy = 0; dy < sh; dy++) {
      const row = (sy + dy) * width
      for (let dx = 0; dx < sw; dx++) {
        const i = row + (sx + dx)
        if (used[i] || paletteIds[i] !== color) return false
      }
    }
    return true
  }

  const mark = (sx: number, sy: number, sw: number, sh: number) => {
    for (let dy = 0; dy < sh; dy++) {
      const row = (sy + dy) * width
      used.fill(1, row + sx, row + sx + sw)
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (used[i]) continue
      const color = paletteIds[i]
      let placed = false
      for (const [sw, sh] of ordered) {
        if (fits(x, y, sw, sh, color)) {
          mark(x, y, sw, sh)
          tiles.push({ x, y, w: sw, h: sh, colorId: color })
          placed = true
          break
        }
      }
      if (!placed) {
        // fallback to 1x1 to guarantee termination
        mark(x, y, 1, 1)
        tiles.push({ x, y, w: 1, h: 1, colorId: color })
      }
    }
  }

  return tiles
}
