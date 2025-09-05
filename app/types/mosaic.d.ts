export type PaletteColor = { name:string; hex:string; rgb:[number,number,number]; price_1x1:number }
export type BomRow = {
  part:string
  color_name:string
  hex:string
  color_id?: number
  qty:number
  unit_price:number
  total_price:number
}

export type Placement = { x:number; y:number; w:number; h:number; color:number; part:string }

export type WorkerIn = {
  type:'process'
  image: ImageBitmap
  width:number
  height:number
  palette:PaletteColor[]
  greedy?: boolean
  dither?: boolean              // <-- NEW
  distance?: 'ciede2000' | 'euclid'
}

export type WorkerOut = {
  width:number
  height:number
  palette:PaletteColor[]
  indexes:Uint16Array
  // Always-provided undithered mapping used for tiler
  quantizedIndexes?: Uint16Array
  bomSingles: BomRow[]
  placements?: Placement[]
  bomGreedy?: BomRow[]
  timings?: { preprocess:number; quantize:number; tile:number; bom:number; total:number }
}
