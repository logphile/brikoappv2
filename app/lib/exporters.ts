import type { BomRow } from '@/types/mosaic'
import { canvasToPngBlob } from '@/utils/canvas-to-png'
import { legoPalette } from '@/lib/palette/lego'

export function downloadCsv(rows: BomRow[], name='briko_bom.csv'){
  const esc = (v: unknown) => '"' + String(v).replace(/"/g, '""') + '"'
  const header = 'part,color,hex,qty,unit_price,total_price\r\n'
  const body = rows
    .map(r=>[esc(r.part),esc(r.color_name),esc(r.hex),esc(r.qty),esc(r.unit_price),esc(r.total_price)].join(','))
    .join('\r\n')
  const blob = new Blob([header+body+'\r\n'], {type:'text/csv'})
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click(); URL.revokeObjectURL(a.href)
}

// Normalized BOM CSV (V2)
// Columns: Part, Size, ColorName, BricklinkColorID, LEGOColorID, Qty, EstUnitPrice, EstTotal
type BomV2Row = { part: string; size: string; colorName: string; bricklinkColorId: number | string; legoColorId?: number | string; qty: number; unit: number; total: number }
export function downloadBomCsvV2(rows: Week1Row[], name='briko-shopping-list.csv'){
  const header = 'Part,Size,ColorName,BricklinkColorID,LEGOColorID,Qty,EstUnitPrice,EstTotal\r\n'
  const getColorName = (cid: number) => legoPalette[cid]?.name || `Color ${cid}`
  const toLine = (r: Week1Row) => {
    const size = r.part
    const partName = (r.part.toLowerCase().includes('plate') || r.part.includes('×')) ? `Plate ${size.replace('x','×')}` : `Plate ${size.replace('x','×')}`
    const colorName = getColorName(r.colorId)
    const blId = r.colorId // placeholder — map when available
    const legoId = '' // optional for now
    const unit = r.estUnitPrice.toFixed(2)
    const total = r.estTotal.toFixed(2)
    const esc = (v: unknown) => '"' + String(v).replace(/"/g, '""') + '"'
    return [esc(partName), esc(size.replace('x','×')), esc(colorName), esc(blId), esc(legoId), r.qty, unit, total].join(',')
  }
  const body = rows.map(toLine).join('\r\n')
  const blob = new Blob([header + body + '\r\n'], { type:'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click(); URL.revokeObjectURL(a.href)
}

export async function downloadPng(filename='mosaic.png'){
  const cvs: HTMLCanvasElement | OffscreenCanvas | undefined = (window as any).__brikoCanvas
  if(!cvs) return
  try {
    const blob = await canvasToPngBlob(cvs as any)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    URL.revokeObjectURL(a.href)
  } catch (err) {
    // Fallback: attempt toDataURL on HTMLCanvasElement only
    try {
      const htmlCvs = cvs as HTMLCanvasElement
      const a = document.createElement('a')
      a.href = htmlCvs.toDataURL('image/png'); a.download = filename; a.click()
    } catch {}
  }
}

// Week-1 CSV exporter for new BOM shape
type Week1Row = { part: string; colorId: number; qty: number; estUnitPrice: number; estTotal: number }
export function downloadBomCsvWeek1(rows: Week1Row[], name='briko-bom.csv'){
  const esc = (v: unknown) => '"' + String(v).replace(/"/g, '""') + '"'
  const header = 'Part,ColorId,Quantity,EstUnitPrice,EstTotal\r\n'
  const body = rows
    .map(r=>[esc(r.part), r.colorId, r.qty, r.estUnitPrice.toFixed(2), r.estTotal.toFixed(2)].join(','))
    .join('\r\n')
  const blob = new Blob([header+body+'\r\n'], {type:'text/csv'})
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click(); URL.revokeObjectURL(a.href)
}
