import type { BOMRow, StudSize, TiledBrick } from '@/types/mosaic'
import { multiplierForColorName } from '@/lib/price-buckets'

export function buildBOM(
  bricks: TiledBrick[],
  priceTable: Record<StudSize, number>
): { rows: BOMRow[]; total: number } {
  const map = new Map<string, { part: StudSize; colorId: number; qty: number }>()
  for (const b of bricks) {
    const part = `${b.w}x${b.h}` as StudSize
    const key = `${part}|${b.colorId}`
    const row = map.get(key) || { part, colorId: b.colorId, qty: 0 }
    row.qty++
    map.set(key, row)
  }
  const rows: BOMRow[] = []
  let total = 0
  for (const r of map.values()) {
    const estUnitPrice = priceTable[r.part] ?? 0
    const estTotal = +(r.qty * estUnitPrice).toFixed(2)
    total += estTotal
    rows.push({ part: r.part, colorId: r.colorId, qty: r.qty, estUnitPrice, estTotal })
  }
  // Sort by area desc, then by colorId
  rows.sort((a, b) => {
    const [aw, ah] = a.part.split('x').map(Number)
    const [bw, bh] = b.part.split('x').map(Number)
    const ad = (bw * bh) - (aw * ah)
    return ad !== 0 ? ad : a.colorId - b.colorId
  })
  total = +total.toFixed(2)
  return { rows, total }
}

// Bucket-aware variant: applies color availability multipliers to base unit prices
export function buildBOMWithBuckets(
  bricks: TiledBrick[],
  priceTable: Record<StudSize, number>,
  palette: { name: string }[]
): { rows: BOMRow[]; total: number } {
  const map = new Map<string, { part: StudSize; colorId: number; qty: number }>()
  for (const b of bricks) {
    const part = `${b.w}x${b.h}` as StudSize
    const key = `${part}|${b.colorId}`
    const row = map.get(key) || { part, colorId: b.colorId, qty: 0 }
    row.qty++
    map.set(key, row)
  }
  const rows: BOMRow[] = []
  let total = 0
  for (const r of map.values()) {
    const base = priceTable[r.part] ?? 0
    const colorName = palette[r.colorId]?.name || ''
    const mult = multiplierForColorName(colorName)
    const estUnitPrice = +(base * mult).toFixed(2)
    const estTotal = +(r.qty * estUnitPrice).toFixed(2)
    total += estTotal
    rows.push({ part: r.part, colorId: r.colorId, qty: r.qty, estUnitPrice, estTotal })
  }
  // Sort by area desc, then by colorId
  rows.sort((a, b) => {
    const [aw, ah] = a.part.split('x').map(Number)
    const [bw, bh] = b.part.split('x').map(Number)
    const ad = (bw * bh) - (aw * ah)
    return ad !== 0 ? ad : a.colorId - b.colorId
  })
  total = +total.toFixed(2)
  return { rows, total }
}
