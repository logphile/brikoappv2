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

function ensureSpace(pdf:any, need:number, y:number, top:number){
  const H = pdf.internal.pageSize.getHeight()
  const bottom = 28
  if (y + need > H - bottom) { pdf.addPage(); return top }
  return y
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
  y += 16

  // ==== NEW: stacked badges (4 equal columns, centered)
  const stats = [
    { label: 'Studs',      value: `${a.cols} × ${a.rows}`  },
    { label: 'Bricks',     value: fmtInt(a.totalBricks) },
    { label: 'Colors',     value: String(a.distinctColors) },
    { label: 'Est. Price', value: `$${a.estimateUSD.toFixed(2)}`  },
  ]
  const cols = 4, pillGap = 12, pillH = 32
  const pillW = (slabW - pillGap*(cols-1)) / cols
  let px = slabX
  for (const p of stats) {
    pdf.setDrawColor(THEME.pillStroke)
    pdf.setFillColor(THEME.pillBg.r, THEME.pillBg.g, THEME.pillBg.b)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(px, y, pillW, pillH, 10, 10, 'FD')

    // value (big, centered)
    pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary)
    pdf.text(p.value, px + pillW/2, y + 13, { align: 'center' })

    // label (muted, centered, below)
    pdf.setFont('Outfit','medium'); pdf.setFontSize(9); pdf.setTextColor(THEME.text.muted)
    pdf.text(p.label, px + pillW/2, y + 23, { align: 'center' })

    px += pillW + pillGap
  }
  y += pillH + 16

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
  // --- generous space after hero ---
  y += heroH + pad * 2;
  y += 24;

  // --- Build size (simple, centered 2-col) ---
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
  pdf.text('Build size', W/2, y, { align:'center' }); y += 10;

  const gap = 48;
  const colW = (slabW - gap) / 2;
  const L = slabX, R = slabX + colW + gap;

  const spec = (label:string, value:string, X:number, Y:number)=>{
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8);  pdf.setTextColor(THEME.text.secondary);
    pdf.text(label.toUpperCase(), X, Y);
    pdf.setFont('Outfit','bold');   pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
    pdf.text(value, X, Y + 8);
  };
  spec('Dimensions (inches)',      `${a.widthIn} × ${a.heightIn} in` , L, y);
  spec('Dimensions (centimeters)', `${a.widthCm} × ${a.heightCm} cm` , R, y);
  y += 26;

  // --- divider ---
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.4);
  pdf.line(slabX, y, slabX + slabW, y);
  y += 12;

  // --- Colors (wrapped, spacious) ---
  pdf.setFont('Outfit','bold'); pdf.setFontSize(13); pdf.setTextColor(THEME.text.primary);
  pdf.text('Colors used in this build', W/2, y, { align:'center' }); y += 12;

  const chipH = 18, sw = 22, gx = 16, gy = 10;
  let cx = slabX, cy = y;

  pdf.setFont('Outfit','normal'); pdf.setFontSize(10);

  for (const p of a.palette) {
    const name = p.name ?? String(p.colorId);
    const chipW = sw + 8 + Math.ceil(pdf.getTextWidth(name));

    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gy; }

    const c = (()=>{ const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(p.hex||'')||['','cc','cc','cc']; return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) }})();
    pdf.setDrawColor(224); pdf.setFillColor(c.r,c.g,c.b);
    pdf.roundedRect(cx, cy - chipH + 12, sw, chipH, 3, 3, 'FD');

    pdf.setTextColor(THEME.text.primary);
    pdf.text(name, cx + sw + 8, cy + 3);

    cx += chipW + gx;
  }

  // DEV tag — confirm this version ran
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v4.2', 12, H - 14)
}
