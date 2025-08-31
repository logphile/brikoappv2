export type PaletteColor = { name:string; hex:string; rgb:[number,number,number]; price_1x1:number }
export type BomRow = { part:'Plate 1×1'; color_name:string; hex:string; qty:number; unit_price:number; total_price:number }
export type WorkerIn = { type:'process'; image: ImageBitmap; width:number; height:number; palette:PaletteColor[] }
export type WorkerOut = { width:number; height:number; palette:PaletteColor[]; indexes:Uint16Array; bom:BomRow[] }
