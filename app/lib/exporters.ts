import type { BomRow } from '@/types/mosaic'

export function downloadCsv(rows: BomRow[], name='briko_bom.csv'){
  const header = 'part,color,hex,qty,unit_price,total_price\n'
  const body = rows.map(r=>[r.part,r.color_name,r.hex,r.qty,r.unit_price,r.total_price].join(',')).join('\n')
  const blob = new Blob([header+body], {type:'text/csv'})
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click(); URL.revokeObjectURL(a.href)
}

export function downloadPng(filename='mosaic.png'){
  const cvs: HTMLCanvasElement | undefined = (window as any).__brikoCanvas
  if(!cvs) return
  const a = document.createElement('a')
  a.href = cvs.toDataURL('image/png'); a.download = filename; a.click()
}
