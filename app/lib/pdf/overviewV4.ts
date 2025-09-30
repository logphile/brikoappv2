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
  // ------------------- spacing after hero -------------------
  y += heroH + pad * 2 + 28; // more breathing room

  // ------------------- Build size (clean 2x layout) -------------------
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
  pdf.text('Build size', W/2, y, { align: 'center' });
  y += 9;

  const specGap = 44;                           // wider gap between columns
  const specColW = (slabW - specGap) / 2;
  const specLeft  = slabX;
  const specRight = slabX + specColW + specGap;

  const specRow = (label: string, value: string, X: number, Y: number) => {
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8);  pdf.setTextColor(THEME.text.secondary);
    pdf.text(label.toUpperCase(), X, Y);
    pdf.setFont('Outfit','bold');   pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
    pdf.text(value, X, Y + 8);
  };

  // two rows only — inches & centimeters (the headline stats live in the badges)
  specRow('Dimensions (inches)',      `${a.widthIn} × ${a.heightIn} in` , specLeft,  y);
  specRow('Dimensions (centimeters)', `${a.widthCm} × ${a.heightCm} cm` , specRight, y);
  y += 26; // row height

  // Divider
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.4)
  pdf.line(slabX, y, slabX + slabW, y); y += 12

  // ------------------- Colors section -------------------
  pdf.setFont('Outfit','bold'); pdf.setFontSize(13); pdf.setTextColor(THEME.text.primary);
  pdf.text('Colors used in this build', W/2, y, { align: 'center' });
  y += 12;

  // pre-measure chips to avoid crowding; break page if needed
  const chipH = 18, swW = 22, gapX = 14, gapY = 10;
  const chipsHeight = (() => {
    let cx = slabX, lines = 1;
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10);
    for (const p of a.palette) {
      const name = p.name ?? String(p.colorId);
      const chipW = swW + 8 + Math.ceil(pdf.getTextWidth(name));
      if (cx + chipW > slabX + slabW) { lines++; cx = slabX; }
      cx += chipW + gapX;
    }
    return lines * (chipH + gapY);
  })();
  y = ensureSpace(pdf, chipsHeight + 8, y, 40);

  // draw wrapped chips inside the centered slab
  let cx = slabX, cy = y;
  pdf.setFont('Outfit','normal'); pdf.setFontSize(10);
  for (const p of a.palette) {
    const name = p.name ?? String(p.colorId);
    const chipW = swW + 8 + Math.ceil(pdf.getTextWidth(name));
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gapY; }

    const { r, g, b } = rgb(p.hex);
    pdf.setDrawColor(224); pdf.setFillColor(r, g, b);
    pdf.roundedRect(cx, cy - chipH + 12, swW, chipH, 3, 3, 'FD');

    pdf.setTextColor(THEME.text.primary);
    pdf.text(name, cx + swW + 8, cy + 3);

    cx += chipW + gapX;
  }
  y = cy + chipH + 10;

  // DEV tag — confirm this version ran
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v4.2', 12, H - 14)
}
