// Voxelizer worker: supports multiple build modes.
// - relief: classic heightmap (brightness -> column height)
// - layered: centered wall of thickness t
// - hollow: only front/back faces of centered wall

import type { VoxelWorkerIn, VoxelWorkerOut, VoxelGrid, BuildMode } from '@/types/voxel'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { legoPalette } from '@/lib/palette/lego'

self.onmessage = async (e: MessageEvent<VoxelWorkerIn>) => {
  const t0 = (self as any).performance?.now?.() ?? Date.now()
  const { image, size, bands = 8, mode = 'layered' as BuildMode, wallThickness } = e.data

  const oc = new OffscreenCanvas(size, size)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image as any, 0, 0, size, size)
  const img = ctx.getImageData(0,0,size,size)
  const { data } = img

  const depth = size
  const colors = new Uint8Array(size*size*depth) // index into LEGO palette (0..N-1), 255 = empty
  colors.fill(255)
  const totalRows = size
  const progressEvery = Math.max(1, Math.floor(size / 20)) // ~5% increments

  // Quantize the 2D source image to LEGO palette indices once
  const palIdx2D = mapBitmapToPalette(img, legoPalette, { dither: 'none', distance: 'ciede2000' })

  for (let y=0; y<size; y++){
    for (let x=0; x<size; x++){
      const i = (y*size + x)*4
      const r=data[i], g=data[i+1], b=data[i+2]
      const v = Math.round((0.299*r + 0.587*g + 0.114*b))      // brightness 0..255 (for relief height)
      const colorIdx = palIdx2D[y*size + x]

      if (mode === 'relief') {
        const hcol = Math.max(1, Math.round((v/255) * (depth-1)))    // column height based on brightness
        for (let z=0; z<hcol; z++){
          colors[(z*size*size) + (y*size + x)] = colorIdx
        }
      } else {
        // layered or hollow
        const t = Math.min(depth, wallThickness ?? Math.max(6, Math.floor(depth * 0.15)))
        const z0 = Math.floor((depth - t) / 2)
        const z1 = z0 + t - 1
        if (mode === 'layered') {
          for (let z=z0; z<=z1; z++) {
            colors[(z*size*size) + (y*size + x)] = colorIdx
          }
        } else {
          // hollow: front/back faces only
          colors[(z0*size*size) + (y*size + x)] = colorIdx
          if (t > 1) {
            colors[(z1*size*size) + (y*size + x)] = colorIdx
          }
        }
      }
    }
    if (y % progressEvery === 0) {
      const msg: VoxelWorkerOut = { type: 'progress', processed: y, total: totalRows, pct: Math.round((y/totalRows)*100) }
      ;(self as any).postMessage(msg)
    }
  }

  const grid: VoxelGrid = { w: size, h: size, depth, colors }
  const t1 = (self as any).performance?.now?.() ?? Date.now()
  const done: VoxelWorkerOut = { type: 'done', grid, timings: { total: t1 - t0 } }
  ;(self as any).postMessage(done, [colors.buffer])
}
export {}
