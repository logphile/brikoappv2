// Convert image -> heightmap (brightness) -> color index per (x,y,z)
// Columns filled from z=0..h(x,y), using N-band palette indices (default 8 bands)

import type { VoxelWorkerIn, VoxelWorkerOut, VoxelGrid } from '@/types/voxel'

self.onmessage = async (e: MessageEvent<VoxelWorkerIn>) => {
  const t0 = (self as any).performance?.now?.() ?? Date.now()
  const { image, size, bands = 8 } = e.data

  const oc = new OffscreenCanvas(size, size)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image as any, 0, 0, size, size)
  const { data } = ctx.getImageData(0,0,size,size)

  const depth = size
  const colors = new Uint8Array(size*size*depth) // index into demo palette bands (0..bands-1)
  const totalRows = size
  const progressEvery = Math.max(1, Math.floor(size / 20)) // ~5% increments

  for (let y=0; y<size; y++){
    for (let x=0; x<size; x++){
      const i = (y*size + x)*4
      const r=data[i], g=data[i+1], b=data[i+2]
      const v = Math.round((0.299*r + 0.587*g + 0.114*b))      // brightness 0..255
      const h = Math.max(1, Math.round((v/255) * (depth-1)))    // column height
      const colorIdx = Math.min(bands-1, Math.floor((v/255) * (bands)))
      for (let z=0; z<h; z++){
        colors[(z*size*size) + (y*size + x)] = colorIdx
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
