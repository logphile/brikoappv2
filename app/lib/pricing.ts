import type { BomRow } from '@/types/mosaic'

export interface Tile { x:number; y:number; w:number; h:number; colorId:number }

// Default unit prices in USD by size (w x h)
const DEFAULT_PRICES: Record<string, number> = {
  '1x1': 0.03,
  '1x2': 0.05,
  '2x2': 0.09,
  '2x4': 0.14,
  '4x4': 0.22,
  '4x8': 0.35,
}

function keySize(w:number,h:number){ return `${w}x${h}` }

export function buildSingles(counts: Uint32Array, palette: { name:string; hex:string; price_1x1:number }[]): BomRow[] {
  const rows: BomRow[] = []
  for (let i=0;i<counts.length;i++){
    const qty = counts[i]
    if (!qty) continue
    const p = palette[i]
    const unit = p.price_1x1 ?? DEFAULT_PRICES['1x1']
    const total = +(qty*unit).toFixed(2)
    rows.push({ part: 'Plate 1×1', color_name: p.name, hex: p.hex, color_id: i, qty, unit_price: unit, total_price: total })
  }
  return rows
}

export function buildFromTiles(tiles: Tile[], palette: { name:string; hex:string }[]): BomRow[] {
  const map = new Map<string, BomRow>()
  for (const t of tiles){
    const k = `${t.w}x${t.h}|${t.colorId}`
    const p = palette[t.colorId]
    const part = `Plate ${t.w}×${t.h}`
    const unit = DEFAULT_PRICES[keySize(t.w,t.h)] ?? DEFAULT_PRICES['1x1']
    const row = map.get(k) || { part, color_name: p.name, hex: p.hex, color_id: t.colorId, qty: 0, unit_price: unit, total_price: 0 }
    row.qty++
    map.set(k, row)
  }
  const out = Array.from(map.values()).map(r=>({ ...r, total_price: +(r.qty * r.unit_price).toFixed(2) }))
  // Sort by part area descending, then color name
  out.sort((a,b)=>{
    const [aw,ah] = a.part.replace('Plate ','').split('×').map(Number)
    const [bw,bh] = b.part.replace('Plate ','').split('×').map(Number)
    const areaDiff = (bw*bh) - (aw*ah)
    if (areaDiff !== 0) return areaDiff
    return a.color_name.localeCompare(b.color_name)
  })
  return out
}

export function sumBom(bom: BomRow[]): { subtotal:number; itemCount:number }{
  return bom.reduce((acc,r)=>{
    acc.subtotal += r.total_price
    acc.itemCount += r.qty
    return acc
  }, { subtotal: 0, itemCount: 0 })
}
