import type { WorkerIn, WorkerOut, BomRow, Placement } from '@/types/mosaic'
import { preprocessToImageData } from '@/lib/opencv'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { greedyTile } from '@/lib/tiler'
import { buildSingles as buildSinglesBom, buildFromTiles as buildBomFromTiles } from '@/lib/pricing'

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  try {
    const { image, buffer, width, height, palette, greedy = true, dither = true, distance = 'ciede2000' } = e.data

    const post = (data: any, transfer?: Transferable[]) => {
      ;(self as any).postMessage(data, transfer || [])
    }

    const t0 = (self as any).performance.now()
    post({ type: 'progress', stage: 'start', pct: 1 })

    // Accept either a raw RGBA buffer or an ImageBitmap
    let imgData: ImageData
    if (buffer && buffer.byteLength === width * height * 4) {
      imgData = new ImageData(new Uint8ClampedArray(buffer), width, height)
    } else {
      imgData = await preprocessToImageData(image as ImageBitmap, width, height)
    }
    const t1 = (self as any).performance.now()
    post({ type: 'progress', stage: 'preprocess', pct: 30 })

    // Always compute undithered for tiler
    const quantizedIndexes = mapBitmapToPalette(imgData, palette, { dither: 'none', distance })
    // Optionally compute dithered for prettier preview; fallback to undithered
    const indexes = dither
      ? mapBitmapToPalette(imgData, palette, { dither: 'floyd-steinberg', distance })
      : quantizedIndexes
    const t2 = (self as any).performance.now()
    post({ type: 'progress', stage: 'quantize', pct: greedy ? 70 : 85 })

    // counts for singles
    const counts = new Uint32Array(palette.length)
    for (let i = 0; i < indexes.length; i++) counts[indexes[i]]++
    const bomSingles: BomRow[] = buildSinglesBom(counts, palette as any)

    let placements: Placement[] | undefined
    let bomGreedy: BomRow[] | undefined

    const W = imgData.width, H = imgData.height
    if (greedy) {
      // IMPORTANT: Use undithered grid for tiling to allow larger merges
      const tiles = greedyTile(quantizedIndexes, W, H, [[4,8],[4,4],[2,4],[2,2],[1,2],[1,1]])
      placements = tiles.map(t => ({ x: t.x, y: t.y, w: t.w, h: t.h, color: t.colorId, part: `Plate ${t.w}×${t.h}` }))
      bomGreedy = buildBomFromTiles(tiles as any, palette as any)
      post({ type: 'progress', stage: 'tiling', pct: 90 })
    }

    const t3 = (self as any).performance.now()

    // Ensure a final progress event so UIs don't appear stuck (e.g., at 85%)
    post({ type: 'progress', stage: 'finalize', pct: 100 })

    const out: WorkerOut = {
      width: W,
      height: H,
      palette: palette as any,
      indexes,
      quantizedIndexes,
      bomSingles,
      placements,
      bomGreedy,
      timings: { preprocess: t1 - t0, quantize: t2 - t1, tile: (greedy ? t3 - t2 : 0), bom: 0, total: t3 - t0 }
    }
    // Do not transfer pixel buffers; structured clone is fine here.
    post(out)
  } catch (err: any) {
    ;(self as any).postMessage({ type: 'error', message: err?.message || String(err) })
  }
}
