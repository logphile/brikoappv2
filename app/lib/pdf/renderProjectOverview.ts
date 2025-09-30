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

// ---- helpers (near top) ---------------------------------------
function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || ['', 'cc', 'cc', 'cc']
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function ensureSpace(pdf: any, need: number, y: number, top: number) {
  const H = pdf.internal.pageSize.getHeight()
  const bottom = 24 // bottom margin
  if (y + need > H - bottom) {
    pdf.addPage()
    return top
  }
  return y
}

export function renderProjectOverview(pdf: jsPDF, ctx: ProjectOverviewCtx) {
  // Legacy renderer is deprecated. Use renderOverviewV4 instead.
  if ((pdf as any)?.__overview_locked) return; // already locked; skip
  if ((import.meta as any).env?.DEV) throw new Error('Legacy Overview called');
  return; // no-op in prod
  // ---- layout constants ------------------------------------------------------
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const outer = 24                         // page margin
  const slabW = Math.min(540, W - outer*2) // centered content slab width
  const slabX = (W - slabW)/2
  let y = 36                               // top margin
  pdf.setLineHeightFactor(1.25)

  // ---- title -----------------------------------------------------------------
  pdf.setFont('Outfit','bold'); pdf.setFontSize(22); pdf.setTextColor(20)
  pdf.text('Project Overview', W/2, y, { align:'center' })
  y += 14

  // ---- framed hero -----------------------------------------------------------
  const heroPad = 10
  const heroH = Math.min(170, H * 0.32)
  pdf.setDrawColor(228); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255)
  ;(pdf as any).roundedRect?.(slabX, y, slabW, heroH + heroPad*2, 8, 8, 'S') || pdf.rect(slabX, y, slabW, heroH + heroPad*2)

  if (ctx.originalImg) {
    const r = Math.min((slabW - heroPad*2) / Math.max(1, ctx.originalImgW), heroH / Math.max(1, ctx.originalImgH))
    const dw = Math.round(ctx.originalImgW * r), dh = Math.round(ctx.originalImgH * r)
    const dx = slabX + (slabW - dw)/2
    const dy = y + heroPad + (heroH - dh)/2
    pdf.addImage(ctx.originalImg, ctx.originalType, dx, dy, dw, dh, undefined, 'FAST')
  }

  // Visible version tag (bottom-left)
  pdf.setFont('Outfit','bold');
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(OVERVIEW_VERSION, 12, H - 14)

  y += heroH + heroPad*2 + 20  // generous space so specs never collide with hero

  // ---- 2×3 spec grid (draw ONCE) --------------------------------------------
  const gutter = 28
  const colW = (slabW - gutter)/2
  const leftX  = slabX
  const rightX = slabX + colW + gutter
  const rowH = 22

  function spec(label:string, value:string, x:number, yRow:number){
    pdf.setFont('Outfit','medium'); pdf.setFontSize(8); pdf.setTextColor(105)
    pdf.text(label.toUpperCase(), x, yRow)
    pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(20)
    pdf.text(value, x, yRow + 7)
  }

  spec('Stud dimensions',            `${ctx.cols} × ${ctx.rows} studs` , leftX,  y)
  spec('Total bricks',               `${ctx.totalBricks} bricks` ,   rightX, y); y += rowH
  spec('Dimensions (inches)',        `${ctx.widthIn} × ${ctx.heightIn} in` , leftX,  y)
  spec('Number of colors',           `${ctx.distinctColors} colors` ,    rightX, y); y += rowH
  spec('Dimensions (centimeters)',   `${ctx.widthCm} × ${ctx.heightCm} cm` , leftX,  y)
  spec('Estimated price',            `Est. $${(ctx.estimateUSD ?? 0).toFixed(2)}` , rightX, y); y += rowH + 8

  // ---- Colors header ---------------------------------------------------------
  pdf.setFont('Outfit','bold'); pdf.setFontSize(12); pdf.setTextColor(20)
  pdf.text('Colors used in this build', W/2, y, { align:'center' })
  y += 12

  // ---- measure chips; break page if they won't fit --------------------------
  const chipH = 16, swW = 22, gapX = 16, gapY = 10
  const chipsNeededHeight = (() => {
    let cx = slabX, lines = 1
    for (const p of ctx.palette) {
      const label = (p as any).name ?? String((p as any).colorId ?? '')
      pdf.setFont('Outfit','normal'); pdf.setFontSize(10)
      const labelW = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : (pdf as any).getTextWidth?.(label) ?? 60
      const chipW = swW + 6 + labelW
      if (cx + chipW > slabX + slabW) { lines++; cx = slabX }
      cx += chipW + gapX
    }
    return lines * (chipH + gapY)
  })()

  y = ensureSpace(pdf, chipsNeededHeight + 16, y, 36)

  // ---- draw chips (wrapped inside slab) -------------------------------------
  let cx = slabX, cy = y
  for (const p of ctx.palette) {
    const label = (p as any).name ?? String((p as any).colorId ?? '')
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10)

    const labelW = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : (pdf as any).getTextWidth?.(label) ?? 60
    const chipW = swW + 6 + labelW
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + gapY }

    const { r,g,b } = hexToRgb((p as any).hex || '#cccccc')
    pdf.setDrawColor(230); pdf.setFillColor(r,g,b)
    ;(pdf as any).roundedRect?.(cx, cy - chipH + 10, swW, chipH, 3, 3, 'FD') || pdf.rect(cx, cy - chipH + 10, swW, chipH, 'FD')

    pdf.setTextColor(30)
    pdf.text(label, cx + swW + 6, cy + 2)

    cx += chipW + gapX
  }
  y = cy + chipH + 12
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
    const { r, g, b } = hexToRgb(c.hex);
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

// (hexToRgb defined near top for v2.4 layout)

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
