import type { jsPDF } from "jspdf";

export type PaletteItem = { name: string; hex: string };

export const OVERVIEW_VERSION = 'overview-v2.3';

export type ProjectOverviewCtx = {
  // Mosaic/project stats
  cols: number;            // studs wide
  rows: number;            // studs tall
  widthIn: number;         // inches
  heightIn: number;        // inches
  widthCm: number;         // centimeters
  heightCm: number;        // centimeters
  totalBricks: number;
  distinctColors: number;
  estimateUSD?: number;    // optional

  palette: PaletteItem[];  // all colors used
  // optional BOM rows to derive top colors by quantity
  bom?: Array<{ colorName: string; qty: number }>

  // Original image to display (already sized/rasterized)
  originalImg: string;     // dataURL or base64
  originalType: "PNG" | "JPEG";
  originalImgW: number;    // px
  originalImgH: number;    // px
};

export function renderProjectOverview(pdf: jsPDF, ctx: ProjectOverviewCtx) {
  // page & slab
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 18;                       // outer page margin
  const slabW = Math.min(pageW - margin*2, 520); // fixed-ish content width
  const slabX = (pageW - slabW) / 2;       // centers the whole slab
  let y = 28;

  // Title (centered)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(22); pdf.setTextColor(20);
  pdf.text('Project Overview', pageW/2, y, { align:'center' });
  y += 10;

  // Hero (framed, centered inside slab)
  const pad = 8; 
  const heroH = Math.min( (pageH * 0.33), 170 );
  const heroW = slabW - pad*2;
  pdf.setDrawColor(220); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255);
  ;(pdf as any).roundedRect?.(slabX, y, slabW, heroH + pad*2, 6, 6, 'S') || pdf.rect(slabX, y, slabW, heroH + pad*2);

  if (ctx.originalImg) {
    const r = Math.min(heroW / Math.max(1, ctx.originalImgW), heroH / Math.max(1, ctx.originalImgH));
    const dw = Math.floor(ctx.originalImgW * r), dh = Math.floor(ctx.originalImgH * r);
    const dx = slabX + (slabW - dw)/2;     // centered within slab
    const dy = y + pad + (heroH - dh)/2;
    pdf.addImage(ctx.originalImg, ctx.originalType, dx, dy, dw, dh, undefined, 'FAST');
  }

  // Visible version tag (bottom-left)
  pdf.setFont('Outfit','bold'); 
  pdf.setFontSize(8); 
  pdf.setTextColor(120);
  const W = pageW; const H = pageH;
  pdf.text(OVERVIEW_VERSION, 12, H - 14);

  y += heroH + pad*2 + 12;

  // 2×3 spec grid (left/right within centered slab)
  pdf.setFont('Outfit','normal'); pdf.setFontSize(9); pdf.setTextColor(90);
  const gutter = 24;
  const colW = (slabW - gutter)/2;
  const leftX = slabX;
  const rightX = slabX + colW + gutter;

  function spec(label:string, value:string, x:number) {
    pdf.setFontSize(8); pdf.setTextColor(100);
    pdf.text(label.toUpperCase(), x, y);
    pdf.setFont('Outfit','bold'); pdf.setFontSize(11); pdf.setTextColor(20);
    pdf.text(value, x, y + 5);
  }

  const fmtIn = (n:number) => Number.isFinite(n) ? (n as number).toFixed(1) : '—';
  const fmtCm = (n:number) => Number.isFinite(n) ? (n as number).toFixed(1) : '—';
  const fmtEst = (n: number | undefined) => (typeof n === 'number') ? `Est. $${n.toFixed(2)}` : '—';

  spec('Stud dimensions', `${ctx.cols} × ${ctx.rows} studs` , leftX);
  spec('Total bricks', `${ctx.totalBricks.toLocaleString()} bricks` , rightX);
  y += 14;
  spec('Dimensions (inches)', `${fmtIn(ctx.widthIn)} × ${fmtIn(ctx.heightIn)} in` , leftX);
  spec('Number of colors', `${ctx.distinctColors} colors` , rightX);
  y += 14;
  spec('Dimensions (centimeters)', `${fmtCm(ctx.widthCm)} × ${fmtCm(ctx.heightCm)} cm` , leftX);
  spec('Estimated price', fmtEst(ctx.estimateUSD) , rightX);
  y += 18;

  // Colors header (centered)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(20);
  pdf.text('Colors used in this build', pageW/2, y, { align:'center' });
  y += 8;

  // Wrapped color chips within centered slab
  const chipH = 14, chipGap = 10;
  let cx = slabX, cy = y;

  for (const p of ctx.palette) {
    const sw = 22; // swatch width
    const label = p.name || '';
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10); 
    const labelW = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : 60;
    const chipW = sw + 6 + labelW; // swatch + space + text

    // wrap if exceeding slab
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + chipGap; }

    // swatch
    const [r,g,b] = hexToRgb(p.hex || '#cccccc');
    pdf.setFillColor(r, g, b);
    pdf.setDrawColor(230);
    ;(pdf as any).roundedRect?.(cx, cy - chipH + 10, sw, chipH, 3, 3, 'FD') || pdf.rect(cx, cy - chipH + 10, sw, chipH, 'FD');

    // label
    pdf.setTextColor(30);
    pdf.text(label, cx + sw + 6, cy + 2);

    cx += chipW + 16; // gap between chips
  }
  y = cy + chipH + 14;
}

/* ---------------------------- helpers ---------------------------- */

function fitRect(srcW: number, srcH: number, maxW: number, maxH: number) {
  const r = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.floor(srcW * r), h: Math.floor(srcH * r) };
}

function buildSpecs(ctx: ProjectOverviewCtx): Array<{ label: string; value: string }> {
  const studs = `${ctx.cols} × ${ctx.rows} studs`;
  const print = `${ctx.widthIn.toFixed(1)} × ${ctx.heightIn.toFixed(1)} in (${ctx.widthCm.toFixed(1)} × ${ctx.heightCm.toFixed(1)} cm)`;
  const total = `${ctx.totalBricks.toLocaleString()}`;
  const colors = `${ctx.distinctColors}`;
  const perStep = `${ctx.cols} new plates`;
  // Use area-based ceil to estimate count of 16×16 plates covering the build
  const baseCount = Math.max(1, Math.ceil((ctx.cols * ctx.rows) / 256));
  const base = `16×16 plates × ${baseCount}`;
  return [
    { label: "STUDS", value: studs },
    { label: "PRINT SIZE", value: print },
    { label: "TOTAL PLATES", value: total },
    { label: "COLORS", value: colors },
    { label: "PER-STEP PACE", value: perStep },
    { label: "BASE", value: base },
  ];
}

function drawStatsGrid(
  pdf: jsPDF,
  items: Array<{ label: string; value: string }>,
  x: number,
  y: number,
  maxW: number
) {
  const colGap = 24;
  const labelSize = 9;     // small caps
  const valueSize = 12;
  const rowGap = 8;

  // Decide columns: 2 columns if we have width; otherwise 1
  const colW = (maxW - colGap) / 2;
  const useTwoCols = colW >= 200 && items.length >= 4;
  const perCol = useTwoCols ? Math.ceil(items.length / 2) : items.length;

  const drawItem = (ix: number, iy: number, item: { label: string; value: string }) => {
    pdf.setFont("Outfit", "bold");
    pdf.setTextColor(75);
    pdf.setFontSize(labelSize);
    pdf.text(item.label, ix, iy, { baseline: "alphabetic" });

    pdf.setFont("Outfit", "normal");
    pdf.setTextColor(17);
    pdf.setFontSize(valueSize);
    pdf.text(item.value, ix, iy + 12);
  };

  let cx = x, cy = y;
  for (let i = 0; i < items.length; i++) {
    // Column/row position
    const colIndex = useTwoCols ? (i < perCol ? 0 : 1) : 0;
    const rowIndex = useTwoCols ? (i % perCol) : i;

    const ix = x + colIndex * (colW + colGap);
    const iy = y + rowIndex * (valueSize + rowGap + 14); // 14 to include label->value spacing

    drawItem(ix, iy, items[i]);

    // track bottom
    const itemBottom = iy + valueSize + rowGap;
    if (itemBottom > cy) cy = itemBottom;
  }
  return cy; // bottom Y
}

export function layoutPaletteRows(
  pdf: jsPDF,
  x: number,
  y: number,
  maxW: number,
  items: PaletteItem[],
  sw: number,
  gap: number
) {
  // how many swatches fit per row?
  const perRow = Math.max(6, Math.min(12, Math.floor((maxW + gap) / (sw + gap))));
  const labelFont = 9;
  const rowH = sw + 4 + labelFont + 2; // swatch + gap + label + small buffer

  let cx = x, cy = y;

  items.forEach((c, idx) => {
    if (idx > 0 && idx % perRow === 0) {
      cy += rowH + 8;
      cx = x;
    }
    const [r, g, b] = hexToRgb(c.hex);
    pdf.setFillColor(r, g, b);
    pdf.rect(cx, cy, sw, sw, "F");

    // label (truncate if too wide)
    pdf.setFont("Outfit", "normal");
    pdf.setTextColor(60);
    pdf.setFontSize(labelFont);
    const label = truncateToWidth(pdf, c.name, sw + 40); // allow a bit wider than swatch
    pdf.text(label, cx, cy + sw + 10);

    cx += sw + gap;
  });

  return cy + rowH;
}

function truncateToWidth(pdf: jsPDF, str: string, maxW: number) {
  const w = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(str) : 0;
  if (w <= maxW) return str;
  let s = str;
  while (s.length > 1 && (pdf as any).getTextWidth(s + "…") > maxW) s = s.slice(0, -1);
  return s + "…";
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const int = parseInt(m.length === 3 ? m.split("").map(ch => ch + ch).join("") : m, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/* ---------------------------- extras ---------------------------- */
function formatTimeRange(steps: number){
  const min = Math.ceil((steps * 2.2) / 5) * 5;
  const max = Math.ceil((steps * 3.0) / 5) * 5;
  // show as a range if > 60, otherwise single value
  if (min >= 60 || max >= 60) {
    const a = Math.max(60, min), b = Math.max(60, max);
    return `${Math.floor(a/60)}–${Math.ceil(b/60)} hrs`;
  } else {
    return `${min}–${max} mins`;
  }
}

function drawValueBox(pdf:any, x:number, y:number, w:number, estimate?:number){
  const pad = 12; const h = 140;
  pdf.setDrawColor(229,231,235); pdf.setLineWidth(0.8); pdf.rect(x, y, w, h);
  pdf.setFont('Outfit','bold'); pdf.setTextColor(17); pdf.setFontSize(12);
  pdf.text('Why this is worth building', x + pad, y + 20);
  pdf.setFont('Outfit','normal'); pdf.setTextColor(120); pdf.setFontSize(9);
  pdf.text('Official wall-art sets: $119–$149', x + pad, y + 36);
  // estimate
  pdf.setFont('Outfit','heavy'); pdf.setTextColor(255,0,98); pdf.setFontSize(18);
  const est = (estimate!=null) ? `$${estimate.toFixed(2)}` : '—';
  pdf.text(`Your custom build: Est. ${est}`, x + pad, y + 58);
  // CTAs
  const btnH = 20; const btnGap = 10; const btn1W = Math.min(180, Math.max(140, Math.floor(w*0.55)));
  const btn2W = Math.min(170, Math.max(120, w - btn1W - btnGap - 2*pad));
  const by = y + h - pad - btnH;
  // primary (pink)
  pdf.setFillColor(255,0,98); pdf.rect(x + pad, by, btn1W, btnH, 'F');
  pdf.setFont('Outfit','bold'); pdf.setTextColor(255); pdf.setFontSize(10);
  pdf.text('Create Wanted List', x + pad + 10, by + 14);
  try { (pdf as any).link?.(x + pad, by, btn1W, btnH, { url: 'https://briko.app/parts' }) } catch {}
  // secondary (outline purple)
  const bx2 = x + pad + btn1W + btnGap;
  pdf.setDrawColor(47,48,97); pdf.setLineWidth(1); pdf.rect(bx2, by, btn2W, btnH);
  pdf.setTextColor(47,48,97); pdf.text('Remix in Briko Studio', bx2 + 10, by + 14);
  try { (pdf as any).link?.(bx2, by, btn2W, btnH, { url: 'https://briko.app/mosaic' }) } catch {}
  // printed URLs for accessibility
  pdf.setFont('Outfit','normal'); pdf.setTextColor(120); pdf.setFontSize(8);
  pdf.text('briko.app/parts', x + pad, by + btnH + 12);
  pdf.text('briko.app/mosaic', bx2, by + btnH + 12);
  return h;
}

function drawCheckbox(pdf:any, x:number, y:number, label:string){
  pdf.setDrawColor(200); pdf.setLineWidth(0.6); pdf.rect(x, y, 8, 8);
  pdf.setTextColor(60); pdf.text(label, x + 12, y + 7);
}

function getTopColors(ctx: ProjectOverviewCtx, n=5){
  if (!ctx.bom || !ctx.bom.length) return [] as Array<{ name:string; qty:number }>;
  const tally = new Map<string, number>();
  for (const r of ctx.bom) {
    const k = r.colorName || 'Color';
    tally.set(k, (tally.get(k) || 0) + (r.qty || 0));
  }
  return Array.from(tally.entries()).map(([name, qty]) => ({ name, qty }))
    .sort((a,b)=> b.qty - a.qty)
    .slice(0, n);
}
