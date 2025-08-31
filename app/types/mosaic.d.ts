export type PaletteColor = { name:string; hex:string; rgb:[number,number,number]; price_1x1:number }
export type BomRow = { part:string; color_name:string; hex:string; qty:number; unit_price:number; total_price:number }
export type Placement = { x:number; y:number; w:number; h:number; color:number; part:string }

export type WorkerIn =
  | { type:'process'; image: ImageBitmap; width:number; height:number; palette:PaletteColor[]; greedy?: boolean; dither?: boolean };

export type WorkerOut = {
  width:number; height:number; palette:PaletteColor[]; indexes:Uint16Array;
  bomSingles: BomRow[];
  placements?: Placement[]; bomGreedy?: BomRow[];
}
