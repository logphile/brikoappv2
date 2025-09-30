// app/lib/pdf/overviewV4.ts
import { patchTextGuard } from './guards/overview'
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

// Vertical rhythm (pts)
const R = 6;                        // base unit
const GAP_HERO_TO_TITLE   = 5 * R;  // 30
const GAP_TITLE_TO_DIMS   = 2 * R;  // 12
const GAP_DIMS_TO_RULE    = 3 * R;  // 18
const GAP_RULE_TO_COLORS  = 3 * R;  // 18
const GAP_COLORS_TO_GRID  = 2 * R;  // 12

// Dims layout
const DIM_COL_W = 160;          // width per dim column
const DIM_COL_GAP = 8 * R;      // 48 gap between left/right columns
const DIM_VALUE_SIZE = 14;      // bold number line
const DIM_LABEL_SIZE = 9;       // tiny label line ("in" / "cm")

// Colors grid
const SWATCH = 14;              // square chip size
const GRID_GAP_X = 1.5 * R;     // 9
const GRID_GAP_Y = 1.25 * R;    // 7.5

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
  // Install global text guard once per doc to swallow legacy DIMENSIONS labels while locked
  try { patchTextGuard(pdf) } catch {}
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
  // --- sequence after hero ---
  const heroBottomY = y + heroH + pad * 2;

  // 2a) Bleach strip just under image (kept)
  const stripY = heroBottomY - 2;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(255, 255, 255);
  pdf.rect(slabX, stripY, slabW, 28, 'F');

  // 2b) "Build size" (centered)
  let y2 = heroBottomY + GAP_HERO_TO_TITLE;
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
  pdf.text('Build size', W/2, y2, { align:'center' });
  y2 += GAP_TITLE_TO_DIMS;

  // 2c) Two dim columns, centered around midline of slab
  const midX = slabX + slabW / 2;
  const leftX  = midX - DIM_COL_GAP / 2 - DIM_COL_W;
  const rightX = midX + DIM_COL_GAP / 2;

  const drawDim = (colX: number, topY: number, value: string, unit: string) => {
    // value line
    pdf.setFont('Outfit','bold'); pdf.setFontSize(DIM_VALUE_SIZE); pdf.setTextColor(THEME.text.primary);
    pdf.text(value, colX, topY, { align: 'left' });
    // approximate heights (single-line)
    const vH = DIM_VALUE_SIZE;
    // label line (unit)
    pdf.setFont('Outfit','medium'); pdf.setFontSize(DIM_LABEL_SIZE); pdf.setTextColor(THEME.text.secondary);
    pdf.text(unit, colX, topY + vH + 2, { align: 'left' });
    const lH = DIM_LABEL_SIZE;
    return topY + vH + 2 + lH;
  };

  const leftBottom  = drawDim(leftX,  y2, `${a.widthIn} × ${a.heightIn}`, 'in');
  const rightBottom = drawDim(rightX, y2, `${a.widthCm} × ${a.heightCm}`, 'cm');
  y2 = Math.max(leftBottom, rightBottom) + GAP_DIMS_TO_RULE;

  // 2d) Divider rule
  pdf.setDrawColor(THEME.line); pdf.setLineWidth(0.6);
  pdf.line(slabX, y2, slabX + slabW, y2);
  y2 += GAP_RULE_TO_COLORS;

  // 2e) "Colors used in this build" (centered)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(THEME.text.primary);
  pdf.text('Colors used in this build', W/2, y2, { align:'center' });
  y2 += GAP_COLORS_TO_GRID;

  // 2f) Colors grid (wrap with consistent gaps)
  const gridWidth = slabW;
  let gx = slabX;
  let gy = y2;
  pdf.setFont('Outfit','normal'); pdf.setFontSize(10);

  for (const p of a.palette) {
    const name = p.name ?? String(p.colorId);
    const textW = Math.ceil(pdf.getTextWidth(name));
    const itemW = textW + SWATCH + 10 + 12; // swatch + gap + name + padding
    const w = Math.min(Math.max(itemW, 100), 160); // clamp for nice wrap

    if (gx + w > slabX + gridWidth) {
      gx = slabX;
      gy += SWATCH + GRID_GAP_Y + 8; // chip row height + gap
    }

    // swatch
    const c = (()=>{ const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(p.hex||'')||['','cc','cc','cc']; return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) }})();
    pdf.setDrawColor(209,213,219); pdf.setFillColor(c.r,c.g,c.b);
    pdf.rect(gx, gy, SWATCH, SWATCH, 'FD');

    // label
    pdf.setFont('Outfit','medium'); pdf.setFontSize(10); pdf.setTextColor(THEME.text.primary);
    pdf.text(name, gx + SWATCH + 10, gy - 1, { align: 'left' });

    gx += w + GRID_GAP_X;
  }

  // DEV tag — confirm this version ran
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120)
  pdf.text('overview-v4.2', 12, H - 14)
}
