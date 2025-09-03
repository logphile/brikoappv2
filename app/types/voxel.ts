// Voxel types for Briko
// Centralizes worker message shapes and a minimal BrikoProject voxel structure

export interface VoxelGrid {
  w: number
  h: number
  depth: number
  // Flattened array indexed by (z*w*h) + (y*w + x)
  colors: Uint8Array
}

// Messages from the worker
export type VoxelWorkerIn = {
  image: ImageBitmap | OffscreenCanvas | ImageData
  size: number
  bands?: number // number of color bands used for height-based coloring (default 8)
}

export type VoxelProgressMsg = {
  type: 'progress'
  processed: number
  total: number
  pct: number
}

export type VoxelDoneMsg = {
  type: 'done'
  grid: VoxelGrid
  timings?: { total: number }
  project?: BrikoProjectVoxel
}

export type VoxelWorkerOut = VoxelProgressMsg | VoxelDoneMsg

// Minimal Briko project for voxel experiments
export interface BrikoProjectVoxel {
  kind: 'voxel'
  grid: VoxelGrid
  bands: number
  paletteName?: string
  paletteHex?: string[]
  createdAt?: string
  timings?: { total: number }
}
