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

function hexToRgb(hex = '#cccccc'){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || ['','cc','cc','cc']
  return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) }
}

export function renderOverviewV3(a: OverviewArgs){
  const { pdf } = a
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const outer = 24
  const slabW = Math.min(540, W - outer*2)
  const slabX = (W - slabW)/2
  let y = 36

  pdf.setLineHeightFactor(1.25)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(22); pdf.setTextColor(20)
  pdf.text('Project Overview', W/2, y, { align:'center' })
  y += 16

  // hero
  const pad = 10, heroH = Math.min(170, H*0.32)
  pdf.setDrawColor(228); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255)
  pdf.roundedRect(slabX, y, slabW, heroH + pad*2, 8, 8, 'S')
  if (a.originalImg) {
    const r = Math.min((slabW - pad*2)/a.originalImgW, heroH/a.originalImgH)
    const dw = Math.round(a.originalImgW * r), dh = Math.round(a.originalImgH * r)
    const dx = slabX + (slabW - dw)/2, dy = y + pad + (heroH - dh)/2
    pdf.addImage(a.originalImg, a.originalType, dx, dy, dw, dh, undefined, 'FAST')
  }
  y += heroH + pad*2 + 22

  // specs (draw once)
  const gutter = 28, colW = (slabW - gutter)/2
  const leftX = slabX, rightX = slabX + colW + gutter, rowH = 22
  const spec = (label:string, value:string, x:number, yy:number) => {
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8); pdf.setTextColor(105)
    pdf.text(label.toUpperCase(), x, yy)
    pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(20)
    pdf.text(value, x, yy + 7)
  }
  spec('Stud dimensions', `${a.cols} × ${a.rows} studs` , leftX, y)
  spec('Total bricks', `${a.totalBricks} bricks` , rightX, y); y += rowH
  spec('Dimensions (inches)', `${a.widthIn} × ${a.heightIn} in` , leftX, y)
  spec('Number of colors', `${a.distinctColors} colors` , rightX, y); y += rowH
  spec('Dimensions (centimeters)', `${a.widthCm} × ${a.heightCm} cm` , leftX, y)
  spec('Estimated price', `Est. $${a.estimateUSD.toFixed(2)}` , rightX, y); y += rowH + 10

  // colors
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(20)
  pdf.text('Colors used in this build', W/2, y, { align:'center' })
  y += 12

  const chipH = 16, swW = 22, gapX = 16, gapY = 10
  let cx = slabX, cy = y
  for (const p of a.palette) {
    const label = p.name ?? String(p.colorId)
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10)
    const chipW = swW + 6 + pdf.getTextWidth(label)
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gapY }
    const { r,g,b } = hexToRgb(p.hex)
    pdf.setDrawColor(230); pdf.setFillColor(r,g,b)
    pdf.roundedRect(cx, cy - chipH + 10, swW, chipH, 3, 3, 'FD')
    pdf.setTextColor(30); pdf.text(label, cx + swW + 6, cy + 2)
    cx += chipW + gapX
  }

  // DEV watermark so we know this file ran
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v3', 12, H - 14)
}
