import { renderBuildGuideV2 } from '@/lib/buildGuideV2'
import { legoPalette } from '@/lib/palette/lego'
import { buildBOMWithBuckets } from '@/lib/bom'
import priceTable from '@/data/brick_prices.json'

export type BuildGuideOpts = {
  bricks: Array<{ x:number; y:number; w:number; h:number; colorId:number }>
  width: number
  height: number
  topSurface?: 'plates'|'tiles'
  fileName?: string
  format?: 'a4'|'letter'
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return [204,204,204]
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)]
}

function buildGridFromBricks(bricks: Array<{x:number;y:number;w:number;h:number;colorId:number}>, w:number, h:number){
  const grid: (string|null)[][] = Array.from({ length: h }, () => Array<string|null>(w).fill(null))
  for (const b of bricks) {
    const hex = (legoPalette as any)[b.colorId]?.hex || '#cccccc'
    for (let dy=0; dy<b.h; dy++){
      const yy = b.y + dy; if (yy<0 || yy>=h) continue
      for (let dx=0; dx<b.w; dx++){
        const xx = b.x + dx; if (xx<0 || xx>=w) continue
        grid[yy][xx] = hex
      }
    }
  }
  return grid
}

async function captureOriginal(): Promise<{ dataUrl:string; type:'PNG'|'JPEG'; w:number; h:number } | null> {
  try {
    const anyWin:any = (typeof window !== 'undefined') ? window : null
    let dataUrl: string | null = anyWin?.__brikoOriginalDataUrl || null
    if (!dataUrl) {
      const el = typeof document !== 'undefined' ? document.getElementById('mosaic-preview-capture') : null
      if (!el) return null
      const { default: html2canvas } = await import('html2canvas')
      const cvs = await html2canvas(el as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      dataUrl = cvs.toDataURL('image/png')
    }
    if (!dataUrl) return null
    const type: 'PNG'|'JPEG' = (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) ? 'JPEG' : 'PNG'
    const img = new Image()
    const loaded = new Promise<void>((res, rej)=>{ img.onload = ()=>res(); img.onerror = rej })
    img.src = dataUrl
    await loaded
    return { dataUrl, type, w: img.width, h: img.height }
  } catch { return null }
}

export async function prepareBuildGuidePDF(opts: BuildGuideOpts){
  const { bricks, width, height } = opts

  // Compute BOM and totals (bucket-aware)
  const { rows: bomRows, total: estimate } = buildBOMWithBuckets(bricks as any, priceTable as any, legoPalette as any)

  // Palette items from BOM colors
  const colorIds = Array.from(new Set(bomRows.map((r: any) => r.colorId))) as number[]
  const palette = colorIds.map(id => ({ name: (legoPalette as any)[id]?.name || `Color ${id}`, hex: (legoPalette as any)[id]?.hex || '#cccccc' }))

  // Build cell grid
  const grid = buildGridFromBricks(bricks, width, height)
  // Steps: one row per page; placedThisStep = cells in that row
  const steps = Array.from({ length: height }, (_, row) => {
    const arr: { col:number; row:number; colorHex:string }[] = []
    for (let col=0; col<width; col++){
      const hex = grid[row][col]
      if (hex) arr.push({ col, row, colorHex: hex })
    }
    return arr
  })

  // Resolve color names by hex
  const hexName = new Map<string, string>()
  for (const c of legoPalette as any) { if (c?.hex) hexName.set(String(c.hex).toLowerCase(), String(c.name || c.hex)) }
  const nameFromHex = (hex:string) => hexName.get(String(hex).toLowerCase()) || hex

  // Dimensions in Inches/Centimeters
  const widthIn = width * 0.315
  const heightIn = height * 0.315
  const widthCm = width * 0.8
  const heightCm = height * 0.8

  // Original image
  const original = await captureOriginal()
  if (!original) throw new Error('Original image unavailable for Project Overview')

  // BOM rows mapped for V2 table
  const surfaceLabel = (opts.topSurface === 'tiles') ? 'Tile' : 'Plate'
  const bom = bomRows.map((r: any) => ({
    partLabel: `${surfaceLabel} ${String(r.part).replace('x','×')}`,
    colorName: (legoPalette as any)[r.colorId]?.name || `Color ${r.colorId}`,
    qty: r.qty,
    estimate: typeof r.estTotal === 'number' ? r.estTotal : undefined
  }))

  // Distinct colors count
  const distinctColors = colorIds.length
  const totalBricks = bomRows.reduce((s:number, r:any) => s + (r.qty||0), 0)

  const pdf = await renderBuildGuideV2({
    cols: width, rows: height,
    widthIn, heightIn, widthCm, heightCm,
    totalBricks, distinctColors, estimateUSD: estimate,
    palette,
    originalImg: original.dataUrl, originalType: original.type, originalImgW: original.w, originalImgH: original.h,
    steps,
    nameFromHex,
    bom
  })

  return pdf
}

export async function exportBuildGuidePDF(opts: BuildGuideOpts){
  const pdf = await prepareBuildGuidePDF(opts)
  const fileName = opts.fileName || `briko-build-guide-${opts.topSurface==='tiles'?'tiles':'plates'}.pdf`
  pdf.save(fileName)
}
