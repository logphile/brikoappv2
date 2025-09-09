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

  // --- Title ---
  pdf.setFont("Outfit", "heavy");
  pdf.setTextColor(17); // ink
  pdf.setFontSize(22);
  pdf.text("Project Overview", M, TITLE_Y);

  // --- Original image (centered, large, neatly framed) ---
  // Reserve a good chunk of vertical space for the hero image
  const IMG_MAX_W = W - 2 * M - 2 * FRAME_PAD;
  const IMG_MAX_H = Math.min(H * 0.33, 280); // cap to avoid pushing stats too low
  const fitted = fitRect(ctx.originalImgW, ctx.originalImgH, IMG_MAX_W, IMG_MAX_H);

  const imgX = (W - fitted.w) / 2;
  const imgY = TITLE_Y + GAP_L;

  // Frame
  pdf.setDrawColor(229, 231, 235); // grid-light
  pdf.setLineWidth(0.6);
  ;(pdf as any).roundedRect?.(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD, 10, 10, "S") || pdf.rect(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD);

  // Image
  pdf.addImage(ctx.originalImg, ctx.originalType, imgX, imgY, fitted.w, fitted.h);

  let cursorY = imgY + fitted.h + GAP_L;

  // --- Stats block (two tidy columns; wraps to one on narrow pages) ---
  const stats = buildStats(ctx);
  cursorY = drawStatsGrid(pdf, stats, M, cursorY, W - 2 * M);

  // --- Palette rows (no overflow; wrap neatly) ---
  cursorY += GAP_L;
  pdf.setFont("Outfit", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(17);
  pdf.text("Colors used in this build", M, cursorY);

  cursorY += GAP_S;
  cursorY = layoutPaletteRows(pdf, M, cursorY, W - 2 * M, ctx.palette, SWATCH, SWATCH_GAP);

  // --- Footer line (optional visual separator for long palettes) ---
  // pdf.setDrawColor(229,231,235); pdf.setLineWidth(0.5);
  // pdf.line(M, H - 28, W - M, H - 28);
}

/* ---------------------------- helpers ---------------------------- */

function fitRect(srcW: number, srcH: number, maxW: number, maxH: number) {
  const r = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.floor(srcW * r), h: Math.floor(srcH * r) };
}

function buildStats(ctx: ProjectOverviewCtx): Array<{ label: string; value: string }> {
  const studs = `${ctx.cols} × ${ctx.rows} studs`;
  const inches = `${ctx.widthIn.toFixed(1)} × ${ctx.heightIn.toFixed(1)} in`;
  const cm = `${ctx.widthCm.toFixed(1)} × ${ctx.heightCm.toFixed(1)} cm`;
  const bricks = `${ctx.totalBricks.toLocaleString()} bricks`;
  const colors = `${ctx.distinctColors} colors`;
  const price = ctx.estimateUSD != null ? `Est. $${ctx.estimateUSD.toFixed(2)}` : undefined;

  const arr: Array<{ label: string; value: string }> = [
    { label: "STUD DIMENSIONS", value: studs },
    { label: "DIMENSIONS (INCHES)", value: inches },
    { label: "DIMENSIONS (CENTIMETERS)", value: cm },
    { label: "TOTAL BRICKS", value: bricks },
    { label: "NUMBER OF COLORS", value: colors },
  ];
  if (price) arr.push({ label: "ESTIMATED PRICE", value: price });
  return arr;
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
