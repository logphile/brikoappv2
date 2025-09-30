// app/lib/pdf/overviewV4.ts
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
  text: { primary: 20, secondary: 85, muted: 125 },
  line: 228,
  pillBg: { r: 246, g: 247, b: 249 },
  pillStroke: 215
}

const mm = (n:number)=>Math.round(n*100)/100
const fmtInt = (n:number)=>{ try { return new Intl.NumberFormat('en-US').format(n) } catch { return String(n) } }
const rgb = (hex?:string)=>{
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex||'') || ['','cc','cc','cc']
  return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) }
}

export function renderOverviewV4(a: OverviewArgs){
  const pdf = a.pdf
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const outer = 28
  const slabW = Math.min(540, W - outer*2)
  const slabX = (W - slabW)/2
  let y = 40

  pdf.setLineHeightFactor(1.25)

  // Title
  pdf.setFont('Outfit','bold'); pdf.setFontSize(24); pdf.setTextColor(THEME.text.primary)
  pdf.text('Project Overview', W/2, y, { align:'center' })
  y += 14

  // === Header badges (modern, centered) ===
  const pills = [
    { label: 'Studs',    value: `${a.cols} × ${a.rows}`  },
    { label: 'Bricks',   value: fmtInt(a.totalBricks) },
    { label: 'Colors',   value: String(a.distinctColors) },
    { label: 'Est. Price', value: `$${a.estimateUSD.toFixed(2)}`  },
  ]

  const pillPadX = 10, pillPadY = 6, pillR = 10, gap = 10
  pdf.setFont('Outfit','bold'); pdf.setFontSize(11)
  const widths = pills.map(p => {
    const w = pdf.getTextWidth(`${p.value}` ) + pdf.getTextWidth('  ') + pdf.getTextWidth(p.label) + pillPadX*2
    return Math.max(80, mm(w))
  })
  const total = widths.reduce((s,w)=>s+w,0) + gap*(pills.length-1)
  let x = slabX + (slabW - total)/2
  for (let i=0;i<pills.length;i++){
    const w = widths[i], h = 24
    pdf.setDrawColor(THEME.pillStroke); pdf.setFillColor(THEME.pillBg.r,THEME.pillBg.g,THEME.pillBg.b); pdf.setLineWidth(0.5)
    pdf.roundedRect(x, y, w, h, pillR, pillR, 'FD')
    // value • label (value bold, label muted)
    pdf.setTextColor(THEME.text.primary); pdf.setFont('Outfit','bold'); pdf.setFontSize(11)
    const vx = x + pillPadX, vy = y + 15
    pdf.text(pills[i].value, vx, vy)
    pdf.setTextColor(THEME.text.muted); pdf.setFont('Outfit','medium'); pdf.setFontSize(9)
    const lx = vx + pdf.getTextWidth(pills[i].value + '  ')
    pdf.text(pills[i].label, lx, vy)
    x += w + gap
  }
  y += 24 + 14

  // === Framed hero (centered) ===
  const pad = 10
  const heroH = Math.min(180, H * 0.34)
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255)
  pdf.roundedRect(slabX, y, slabW, heroH + pad*2, 10, 10, 'S')
  if (a.originalImg){
    const r = Math.min((slabW - pad*2)/a.originalImgW, heroH/a.originalImgH)
    const dw = Math.round(a.originalImgW*r), dh = Math.round(a.originalImgH*r)
    const dx = slabX + (slabW - dw)/2, dy = y + pad + (heroH - dh)/2
    pdf.addImage(a.originalImg, a.originalType, dx, dy, dw, dh, undefined, 'FAST')
  }
  y += heroH + pad*2 + 18

  // === Specs (tidy 2×2; the badges covered the headline stats) ===
  const gutter = 40
  const colW = (slabW - gutter)/2
  const leftX = slabX, rightX = slabX + colW + gutter
  const rowH = 22
  const spec = (label:string, value:string, X:number, Y:number)=>{
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8); pdf.setTextColor(THEME.text.muted)
    pdf.text(label.toUpperCase(), X, Y)
    pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary)
    pdf.text(value, X, Y + 7.5)
  }
  spec('Dimensions (inches)',      `${a.widthIn} × ${a.heightIn} in` , leftX,  y)
  spec('Dimensions (centimeters)', `${a.widthCm} × ${a.heightCm} cm` , rightX, y); y += rowH + 6

  // Divider
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.4)
  pdf.line(slabX, y, slabX + slabW, y); y += 12

  // === Colors (wrapped grid, centered slab) ===
  pdf.setFont('Outfit','bold'); pdf.setFontSize(13); pdf.setTextColor(THEME.text.primary)
  pdf.text('Colors used in this build', W/2, y, { align:'center' }); y += 12

  const chipH = 16, swW = 22, gapX = 16, gapY = 10
  let cx = slabX, cy = y
  pdf.setFont('Outfit','normal'); pdf.setFontSize(10)
  for (const p of a.palette){
    const name = p.name ?? String(p.colorId)
    const chipW = swW + 6 + pdf.getTextWidth(name)
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gapY }
    const c = rgb(p.hex)
    pdf.setDrawColor(230); pdf.setFillColor(c.r,c.g,c.b)
    pdf.roundedRect(cx, cy - chipH + 10, swW, chipH, 3, 3, 'FD')
    pdf.setTextColor(THEME.text.primary); pdf.text(name, cx + swW + 6, cy + 2)
    cx += chipW + gapX
  }

  // DEV tag—remove later
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v4', 12, H - 14)
}
