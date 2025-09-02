import type { WorkerIn, WorkerOut, BomRow, Placement } from '@/types/mosaic'
import { preprocessToImageData } from '@/lib/opencv'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { greedyTile } from '@/lib/tiler'
import { buildSingles as buildSinglesBom, buildFromTiles as buildBomFromTiles } from '@/lib/pricing'

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const { image, width, height, palette, greedy = true, dither = true, distance = 'ciede2000' } = e.data

  const t0 = (self as any).performance.now()
  const imgData = await preprocessToImageData(image, width, height)
  const t1 = (self as any).performance.now()

  const indexes = mapBitmapToPalette(imgData, palette, { dither: dither ? 'floyd-steinberg' : 'none', distance })
  const t2 = (self as any).performance.now()

  // counts for singles
  const counts = new Uint32Array(palette.length)
  for (let i = 0; i < indexes.length; i++) counts[indexes[i]]++
  const bomSingles: BomRow[] = buildSinglesBom(counts, palette as any)

  let placements: Placement[] | undefined
  let bomGreedy: BomRow[] | undefined

  const W = imgData.width, H = imgData.height
  if (greedy) {
    const tiles = greedyTile(indexes, W, H, [[4,8],[4,4],[2,4],[2,2],[1,2],[1,1]])
    placements = tiles.map(t => ({ x: t.x, y: t.y, w: t.w, h: t.h, color: t.colorId, part: `Plate ${t.w}×${t.h}` }))
    bomGreedy = buildBomFromTiles(tiles as any, palette as any)
  }

  const t3 = (self as any).performance.now()

  const out: WorkerOut = {
    width: W,
    height: H,
    palette: palette as any,
    indexes,
    bomSingles,
    placements,
    bomGreedy,
    timings: { preprocess: t1 - t0, quantize: t2 - t1, tile: (greedy ? t3 - t2 : 0), bom: 0, total: t3 - t0 }
  }
  ;(self as any).postMessage(out, [out.indexes.buffer])
}
