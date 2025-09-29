import type { jsPDF } from "jspdf";

export type PaletteItem = { name: string; hex: string };

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
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // --- Layout constants (Letter/A4 friendly) ---
  const M = 40;                 // outer margin
  const TITLE_Y = 56;           // title baseline
  const GAP_L = 16;             // large gap
  const GAP_M = 12;             // medium gap
  const GAP_S = 8;              // small gap
  const FRAME_PAD = 12;         // image frame inset
  const SWATCH = 14;            // palette swatch size
  const SWATCH_GAP = 6;         // gap between swatches

  // --- Hero strip ---
  const steps = ctx.rows;
  const timeLabel = formatTimeRange(steps);
  pdf.setFont("Outfit", "heavy");
  pdf.setTextColor(17); // ink
  pdf.setFontSize(22);
  pdf.text("Your build at a glance", M, TITLE_Y);

  // badges row
  pdf.setFont("Outfit", "normal");
  pdf.setTextColor(60);
  pdf.setFontSize(11);
  const badges = [
    `${steps} steps`,
    `${ctx.cols}×${ctx.rows} studs`,
    `${ctx.distinctColors} colors`,
    `~${ctx.totalBricks.toLocaleString()} plates`
  ].join(" · ");
  pdf.text(badges, M, TITLE_Y + 16);

  // confidence chips
  pdf.setTextColor(17);
  pdf.setFont("Outfit", "bold");
  pdf.text(`Skill: Beginner+ · Time: ${timeLabel}`, M, TITLE_Y + 32);

  // --- Original image (centered, large, neatly framed) ---
  // Reserve a good chunk of vertical space for the hero image
  const IMG_MAX_W = W - 2 * M - 2 * FRAME_PAD;
  const IMG_MAX_H = Math.min(H * 0.33, 280); // cap to avoid pushing stats too low
  const fitted = fitRect(ctx.originalImgW, ctx.originalImgH, IMG_MAX_W, IMG_MAX_H);

  const imgX = (W - fitted.w) / 2;
  const imgY = TITLE_Y + GAP_L + 20; // make room for badges/chips

  // Frame
  pdf.setDrawColor(229, 231, 235); // grid-light
  pdf.setLineWidth(0.6);
  ;(pdf as any).roundedRect?.(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD, 10, 10, "S") || pdf.rect(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD);

  // Image
  pdf.addImage(ctx.originalImg, ctx.originalType, imgX, imgY, fitted.w, fitted.h);

  let cursorY = imgY + fitted.h + GAP_L;

  // --- Two-column area: left = Value box, right = Specs grid ---
  const colGap = 16;
  const colW = (W - 2 * M - colGap);
  const leftW = Math.floor(colW * 0.44); // slightly narrower
  const rightW = colW - leftW;
  const leftX = M;
  const rightX = M + leftW + colGap;
  const yTop = cursorY;

  // Value box (left)
  const vbH = drawValueBox(pdf, leftX, yTop, leftW, ctx.estimateUSD);

  // Specs grid (right)
  const stats = buildSpecs(ctx);
  const statsBottom = drawStatsGrid(pdf, stats, rightX, yTop, rightW);

  cursorY = Math.max(yTop + vbH, statsBottom) + GAP_L;

  // --- Palette rows (no overflow; wrap neatly) ---
  cursorY += GAP_L;
  pdf.setFont("Outfit", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(17);
  pdf.text("Palette (top colors)", M, cursorY);

  // Optional: top 5 color labels
  const top = getTopColors(ctx, 5);
  if (top.length) {
    pdf.setFont("Outfit", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(75);
    const label = top.map(t => `${t.name} (${t.qty.toLocaleString()})`).join(" · ");
    pdf.text(label, M, cursorY + 14);
  }

  cursorY += GAP_S + (top.length ? 18 : 0);
  cursorY = layoutPaletteRows(pdf, M, cursorY, W - 2 * M, ctx.palette, SWATCH, SWATCH_GAP);

  // Actions (right-aligned): Swap a color · Print palette
  pdf.setFont("Outfit", "normal"); pdf.setFontSize(10); pdf.setTextColor(60);
  const actions = "Swap a color   ·   Print palette";
  const tw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(actions) : 0;
  pdf.text(actions, W - M - tw, cursorY + 12);

  // --- Start right checklist (sticky bottom area approximation) ---
  const checkY = Math.min(cursorY + GAP_L, H - 110);
  pdf.setFont("Outfit", "bold"); pdf.setTextColor(17); pdf.setFontSize(11);
  pdf.text("Start right", M, checkY);
  pdf.setFont("Outfit", "normal"); pdf.setTextColor(60); pdf.setFontSize(10);
  drawCheckbox(pdf, M, checkY + 8, "Clear a 16\u2033 × 12\u2033 space");
  drawCheckbox(pdf, M, checkY + 24, "Sort by color first (fastest)");
  drawCheckbox(pdf, M, checkY + 40, "Start at row 1, bottom-left");
  drawCheckbox(pdf, M, checkY + 56, "Use plate outlines if you get lost");
  pdf.setFontSize(9); pdf.setTextColor(120);
  pdf.text("You can build without sorting—sorting just feels faster.", M, checkY + 74);

  // --- Social proof footer bar ---
  const barH = 40;
  const barY = H - barH - 28;
  pdf.setFillColor(239, 240, 255); // light purple tint
  pdf.rect(0, barY, W, barH, "F");
  pdf.setFont("Outfit","bold"); pdf.setFontSize(11); pdf.setTextColor(47,48,97);
  pdf.text("Join other builders—share your result with #brikobuild", M, barY + 24);
  // CTA: View community builds (outline look)
  const ctaW = 170, ctaH = 22; const ctaX = W - M - ctaW; const ctaY = barY + 10;
  pdf.setDrawColor(47,48,97); pdf.setLineWidth(1);
  pdf.rect(ctaX, ctaY, ctaW, ctaH);
  pdf.setFont("Outfit","bold"); pdf.setTextColor(47,48,97); pdf.setFontSize(10);
  pdf.text("View community builds", ctaX + 12, ctaY + 15);
  try { (pdf as any).link?.(ctaX, ctaY, ctaW, ctaH, { url: 'https://briko.app/gallery' }) } catch {}
  // printed URL next to button for accessibility in print
  const urlText = 'briko.app/gallery'
  pdf.setFont('Outfit','normal'); pdf.setTextColor(75); pdf.setFontSize(8)
  const urlW = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(urlText) : 0
  pdf.text(urlText, ctaX - 10 - urlW, ctaY + 15)

  // --- Footer line (optional visual separator for long palettes) ---
  // pdf.setDrawColor(229,231,235); pdf.setLineWidth(0.5);
  // pdf.line(M, H - 28, W - M, H - 28);
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
