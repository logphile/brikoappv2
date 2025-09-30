// app/lib/pdf/overviewV3.ts
export type OverviewArgs = {
  pdf: any
  originalImg: string | null
  originalType: 'PNG'|'JPEG'
  originalImgW: number
  originalImgH: number
  cols: number; rows: number
  totalBricks: number
  widthIn: string; heightIn: string
  widthCm: string; heightCm: string
  distinctColors: number
  estimateUSD: number
  palette: Array<{ name?: string; colorId: number; hex?: string }>
}

const THEME = {
  text: { primary: 20, secondary: 90, muted: 130 },
  line: 228,
}

function hexToRgb(hex = '#cccccc'){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || ['','cc','cc','cc']
  return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) }
}

function fmtInt(n: number){ try { return new Intl.NumberFormat('en-US').format(n) } catch { return String(n) } }

function ensureSpace(pdf:any, need:number, y:number, top:number){
  const H = pdf.internal.pageSize.getHeight()
  const bottom = 28
  if (y + need > H - bottom) {
    pdf.addPage()
    return top
  }
  return y
}

export function renderOverviewV3(a: OverviewArgs){
  throw new Error('[KILL-LEGACY] renderOverviewV3() was called. Use overviewV4.');
  const { pdf } = a
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  
  // Centered content slab
  const outer = 28
  const slabW = Math.min(540, W - outer*2)
  const slabX = (W - slabW)/2
  let y = 40

  pdf.setLineHeightFactor(1.25)
  
  // Title
  pdf.setFont('Outfit','bold'); pdf.setFontSize(24); pdf.setTextColor(THEME.text.primary)
  pdf.text('Project Overview', W/2, y, { align:'center' })
  y += 18

  // Framed hero
  const pad = 10
  const heroH = Math.min(180, H * 0.34)
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255)
  pdf.roundedRect(slabX, y, slabW, heroH + pad*2, 10, 10, 'S')
  if (a.originalImg) {
    const r = Math.min((slabW - pad*2)/a.originalImgW, heroH/a.originalImgH)
    const dw = Math.round(a.originalImgW * r), dh = Math.round(a.originalImgH * r)
    const dx = slabX + (slabW - dw)/2, dy = y + pad + (heroH - dh)/2
    pdf.addImage(a.originalImg, a.originalType, dx, dy, dw, dh, undefined, 'FAST')
  }
  y += heroH + pad*2 + 22   // generous spacing after hero

  // 2×3 spec grid (draw once)
  const gutter = 32
  const colW = (slabW - gutter)/2
  const leftX  = slabX
  const rightX = slabX + colW + gutter
  const rowH = 24
  const spec = (label:string, value:string, x:number, yy:number) => {
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8); pdf.setTextColor(THEME.text.muted)
    pdf.text(label.toUpperCase(), x, yy)
    pdf.setFont('Outfit','bold'); pdf.setFontSize(13); pdf.setTextColor(THEME.text.primary)
    pdf.text(value, x, yy + 7.8)
  }
  spec('Stud dimensions',            `${a.cols} × ${a.rows} studs` , leftX,  y)
  spec('Total bricks',               `${fmtInt(a.totalBricks)} bricks` , rightX, y); y += rowH
  spec('Legacy (inches)',            `${a.widthIn} × ${a.heightIn} in` , leftX,  y)
  spec('Number of colors',           `${a.distinctColors} colors` , rightX, y); y += rowH
  spec('Legacy (centimeters)',       `${a.widthCm} × ${a.heightCm} cm` , leftX,  y)
  spec('Estimated price',            `Est. $${a.estimateUSD.toFixed(2)}` , rightX, y); y += rowH + 12

  // Divider
  pdf.setDrawColor(THEME.line)
  pdf.setLineWidth(0.4)
  pdf.line(slabX, y, slabX + slabW, y)
  y += 12

  // Colors header
  pdf.setFont('Outfit','bold'); pdf.setFontSize(13); pdf.setTextColor(THEME.text.primary)
  pdf.text('Colors used in this build', W/2, y, { align:'center' })
  y += 12

  // Pre-measure chips to optionally push to a new page
  const chipH = 16, swW = 22, gapX = 16, gapY = 10
  const chipsHeight = (() => {
    let cx = slabX, lines = 1
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10)
    for (const p of a.palette) {
      const label = p.name ?? String(p.colorId)
      const chipW = swW + 6 + pdf.getTextWidth(label)
      if (cx + chipW > slabX + slabW) { lines++; cx = slabX }
      cx += chipW + gapX
    }
    return lines * (chipH + gapY)
  })()

  y = ensureSpace(pdf, chipsHeight + 8, y, 40)

  // Draw chips in a wrapped row layout inside the slab
  let cx = slabX, cy = y
  pdf.setFont('Outfit','normal'); pdf.setFontSize(10)
  for (const p of a.palette) {
    const label = p.name ?? String(p.colorId)
    const chipW = swW + 6 + pdf.getTextWidth(label)

    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gapY }

    const { r,g,b } = hexToRgb(p.hex)
    pdf.setDrawColor(230); pdf.setFillColor(r,g,b)
    pdf.roundedRect(cx, cy - chipH + 10, swW, chipH, 3, 3, 'FD')

    pdf.setTextColor(THEME.text.primary)
    pdf.text(label, cx + swW + 6, cy + 2)

    cx += chipW + gapX
  }

  // DEV watermark so we know this file ran
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v3', 12, H - 14)
}
