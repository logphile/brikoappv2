import type { MosaicSettings, TiledBrick } from '@/types/mosaic'
import { parseStudSize, sortByAreaDesc, tryFits } from '@/lib/greedyTiler'

export type InMsg = {
  grid: Uint16Array
  width: number
  height: number
  settings: MosaicSettings
}

export type ProgressMsg = { type: 'progress'; bricksPartial: TiledBrick[]; coveragePct: number }
export type DoneMsg = { type: 'done'; bricks: TiledBrick[] }

function makeCandidates(settings: MosaicSettings): [number, number][] {
  const ordered = sortByAreaDesc(settings.allowedParts)
  const out: [number, number][] = []
  for (const s of ordered) {
    const [sw, sh] = parseStudSize(s)
    if (settings.snapOrientation === 'horizontal') {
      const w = Math.max(sw, sh), h = Math.min(sw, sh)
      out.push([w, h])
    } else if (settings.snapOrientation === 'vertical') {
      const h = Math.max(sw, sh), w = Math.min(sw, sh)
      out.push([w, h])
    } else {
      out.push([sw, sh])
      if (sw !== sh) out.push([sh, sw])
    }
  }
  return out
}

function mark(covered: Uint8Array, width: number, x: number, y: number, w: number, h: number) {
  for (let dy = 0; dy < h; dy++) {
    const row = (y + dy) * width
    covered.fill(1, row + x, row + x + w)
  }
}

self.onmessage = (e: MessageEvent<InMsg>) => {
  const { grid, width, height, settings } = e.data
  const candidates = makeCandidates(settings)
  const allowOne = candidates.some(([w, h]) => w === 1 && h === 1)
  const covered = new Uint8Array(width * height)
  const bricks: TiledBrick[] = []
  let coveredCount = 0

  const chunkRows = 10
  let lastFlush = performance.now()
  let partial: TiledBrick[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (covered[i]) continue
      const color = grid[i]
      let placed = false
      for (let c = 0; c < candidates.length; c++) {
        const [w, h] = candidates[c]
        if (tryFits(grid, covered, width, height, x, y, w, h, color)) {
          mark(covered, width, x, y, w, h)
          const brick = { x, y, w, h, colorId: color }
          bricks.push(brick)
          partial.push(brick)
          coveredCount += w * h
          placed = true
          break
        }
      }
      if (!placed) {
        if (allowOne) {
          // Only place singles if allowed
          mark(covered, width, x, y, 1, 1)
          const brick = { x, y, w: 1, h: 1, colorId: color }
          bricks.push(brick)
          partial.push(brick)
          coveredCount += 1
        } else {
          // Strict enforcement: mark covered but do not place disallowed 1×1
          mark(covered, width, x, y, 1, 1)
          coveredCount += 1
        }
      }

      const now = performance.now()
      if (now - lastFlush > 12) {
        const coveragePct = (coveredCount / (width * height)) * 100
        const msg: ProgressMsg = { type: 'progress', bricksPartial: partial, coveragePct }
        ;(self as any).postMessage(msg)
        partial = []
        lastFlush = now
      }
    }

    if (y > 0 && y % chunkRows === 0 && partial.length) {
      const coveragePct = (coveredCount / (width * height)) * 100
      const msg: ProgressMsg = { type: 'progress', bricksPartial: partial, coveragePct }
      ;(self as any).postMessage(msg)
      partial = []
      lastFlush = performance.now()
    }
  }

  if (partial.length) {
    const coveragePct = (coveredCount / (width * height)) * 100
    const msg: ProgressMsg = { type: 'progress', bricksPartial: partial, coveragePct }
    ;(self as any).postMessage(msg)
  }

  const done: DoneMsg = { type: 'done', bricks }
  ;(self as any).postMessage(done)
}
