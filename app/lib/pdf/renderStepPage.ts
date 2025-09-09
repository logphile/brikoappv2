import type { jsPDF } from "jspdf";

/** A single placed brick/cell in grid coordinates */
export type StepCell = {
  col: number;        // 0..cols-1
  row: number;        // 0..rows-1
  colorHex: string;   // "#RRGGBB"
};

/** Rendering context for a single step page */
export type StepPageCtx = {
  stepIndex: number;                      // 0-based
  grid: { cols: number; rows: number };   // mosaic dimensions in studs
  placedBefore: StepCell[];               // all cells placed in previous steps
  placedThisStep: StepCell[];             // cells placed in this step only
  /** Resolve a human color name for a hex (from your palette map) */
  nameFromHex: (hex: string) => string;

  /** Optional UI strings & colors */
  title?: string;                         // default: "Step {N}"
  ink?: string;                           // default: "#111827"
  gridLight?: string;                     // default: "#E5E7EB"
  gridHeavy?: string;                     // default: "#9CA3AF"
};

export function renderStepPage(pdf: jsPDF, ctx: StepPageCtx) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const ink = ctx.ink ?? "#111827";
  const gridLight = ctx.gridLight ?? "#E5E7EB";
  const gridHeavy = ctx.gridHeavy ?? "#9CA3AF";

  // --- page metrics (larger grid, room for color strip) ---
  const Mx = 40;                    // side margins
  const topHeader = 50;             // header baseline
  const topAfterHeader = 70;        // below header
  const stripGap = 10;              // gap after the color strip
  const bottomMargin = 54;

  // ---------- Header ----------
  pdf.setFont("Outfit", "bold");
  pdf.setTextColor(...rgb(ink));
  pdf.setFontSize(16);
  const stepN = (ctx.stepIndex ?? 0) + 1;
  pdf.text(ctx.title ?? `Step ${stepN}`, Mx, topHeader);

  const newCount = ctx.placedThisStep.length;
  pdf.setFont("Outfit", "normal");
  pdf.setFontSize(10);
  const rightText = `New bricks this step: ${newCount}`;
  pdf.text(rightText, W - Mx, topHeader, { align: "right" });

  // ---------- “Colors used in this step” strip ----------
  const stripYLabel = topAfterHeader;
  pdf.setFont("Outfit", "bold");
  pdf.setTextColor(...rgb(ink));
  pdf.setFontSize(10);
  pdf.text("Colors used in this step:", Mx, stripYLabel);

  const colors = summarizeColors(ctx.placedThisStep, ctx.nameFromHex);
  const stripYStart = stripYLabel + 6;
  const stripBottom = drawColorStrip(pdf, colors, Mx, stripYStart, W - 2 * Mx);

  // ---------- Grid area (bigger) ----------
  const cols = ctx.grid.cols;
  const rows = ctx.grid.rows;

  const gridTop = stripBottom + stripGap;              // push grid below strip
  const cell = Math.min((W - 2 * Mx) / cols, (H - gridTop - bottomMargin) / rows);
  const gridW = cols * cell;
  const gridH = rows * cell;
  const gx = (W - gridW) / 2;                          // center horizontally
  const gy = gridTop;                                   // vertical position

  // Grid lines
  drawGrid(pdf, gx, gy, cols, rows, cell, gridLight, gridHeavy);

  // Previous placements (ghosted 25% opacity or lightened color fallback)
  drawCells(pdf, gx, gy, cell, ctx.placedBefore, {
    stroke: ink,
    alpha: 0.25,         // uses GState if available, falls back to lighten
  });

  // Current step placements (full)
  drawCells(pdf, gx, gy, cell, ctx.placedThisStep, {
    stroke: ink,
    alpha: 1,
  });

  // (Footer with page number/site handled elsewhere)
}

/* ---------------------------- helpers ---------------------------- */

function drawGrid(
  pdf: jsPDF,
  x: number,
  y: number,
  cols: number,
  rows: number,
  size: number,
  lightHex: string,
  heavyHex: string
) {
  const [lr, lg, lb] = rgb(lightHex);
  const [hr, hg, hb] = rgb(heavyHex);
  // thin grid
  pdf.setDrawColor(lr, lg, lb);
  pdf.setLineWidth(0.25);
  for (let c = 0; c <= cols; c++) {
    const cx = x + c * size;
    pdf.line(cx, y, cx, y + rows * size);
  }
  for (let r = 0; r <= rows; r++) {
    const ry = y + r * size;
    pdf.line(x, ry, x + cols * size, ry);
  }
  // baseplate boundaries every 16
  pdf.setDrawColor(hr, hg, hb);
  pdf.setLineWidth(0.7);
  for (let c = 16; c < cols; c += 16) {
    const cx = x + c * size;
    pdf.line(cx, y, cx, y + rows * size);
  }
  for (let r = 16; r < rows; r += 16) {
    const ry = y + r * size;
    pdf.line(x, ry, x + cols * size, ry);
  }
}

type DrawOpts = { stroke: string; alpha: number };

function drawCells(
  pdf: jsPDF,
  x: number,
  y: number,
  size: number,
  cells: StepCell[],
  opts: DrawOpts
) {
  const [sr, sg, sb] = rgb(opts.stroke);
  // Try true alpha via GState; otherwise lighten fill color
  const hasG = (pdf as any).GState != null && (pdf as any).setGState != null;
  const gstate = hasG ? new (pdf as any).GState({ opacity: opts.alpha }) : null;

  pdf.setLineWidth(0.4);
  pdf.setDrawColor(sr, sg, sb);

  for (const cell of cells) {
    const fx = x + cell.col * size;
    const fy = y + cell.row * size;
    const [r, g, b] = rgb(cell.colorHex);

    if (hasG) (pdf as any).setGState(gstate);
    const [fr, fg, fb] = hasG ? [r, g, b] : lighten([r, g, b], 1 - opts.alpha);

    pdf.setFillColor(fr, fg, fb);
    pdf.rect(fx, fy, size, size, "FD");
  }
  if (hasG) (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
}

/** Compute swatches with counts and names for the step */
function summarizeColors(
  placements: StepCell[],
  nameFromHex: (hex: string) => string
): Array<{ hex: string; name: string; count: number }> {
  const map = new Map<string, number>();
  for (const p of placements) map.set(p.colorHex, (map.get(p.colorHex) || 0) + 1);
  return [...map.entries()].map(([hex, count]) => ({
    hex,
    name: nameFromHex(hex),
    count,
  }));
}

/** Draw a wrapping swatch strip; returns bottom Y */
function drawColorStrip(
  pdf: jsPDF,
  items: Array<{ hex: string; name: string; count: number }>,
  x: number,
  y: number,
  maxW: number
) {
  // compact per-step swatches
  const sw = 10;                 // swatch size
  const gap = 6;                 // horizontal gap
  const labelSize = 9;           // small text
  const lineH = sw + 3 + labelSize + 2;
  const perRow = Math.max(6, Math.min(14, Math.floor((maxW + gap) / (sw + gap + 70)))); // reserve ~70px for text

  pdf.setFont("Outfit", "normal");
  pdf.setFontSize(labelSize);
  pdf.setTextColor(60);

  let cx = x, cy = y;
  items.forEach((it, idx) => {
    if (idx > 0 && idx % perRow === 0) {
      cy += lineH + 6;
      cx = x;
    }
    const [r, g, b] = rgb(it.hex);
    pdf.setFillColor(r, g, b);
    pdf.rect(cx, cy, sw, sw, "F");

    const label = `${it.name} (${it.count})`;
    pdf.text(truncate(pdf, label, 120), cx + sw + 6, cy + sw - 1);

    cx += sw + gap + 120; // swatch + gap + label block width
  });

  return cy + lineH;
}

/* ------------------------ tiny utilities ------------------------ */

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? parseInt(h.split("").map((c) => c + c).join(""), 16)
      : parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function lighten([r, g, b]: [number, number, number], amount: number): [number, number, number] {
  // amount 0..1 -> toward white
  const f = (c: number) => Math.round(c + (255 - c) * amount);
  return [f(r), f(g), f(b)];
}

function truncate(pdf: jsPDF, text: string, maxWidth: number): string {
  const w = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(text) : 0;
  if (w <= maxWidth) return text;
  let s = text;
  while (s.length > 1 && (pdf as any).getTextWidth(s + "…") > maxWidth) s = s.slice(0, -1);
  return s + "…";
}
