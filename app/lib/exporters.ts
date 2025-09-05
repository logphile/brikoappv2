import type { BomRow } from '@/types/mosaic'
import { canvasToPngBlob } from '@/utils/canvas-to-png'

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
