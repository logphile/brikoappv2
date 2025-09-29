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
  inkSaver?: boolean;                     // if true, draw keylines only (no heavy fills)
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
  const totalCount = ctx.placedBefore.length + ctx.placedThisStep.length;
  pdf.setFont("Outfit", "normal");
  pdf.setFontSize(10);
  const rightText = `Place now: ${newCount}    •    Total so far: ${totalCount}`;
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
    inkSaver: !!ctx.inkSaver,
  });

  // Current step placements (full)
  drawCells(pdf, gx, gy, cell, ctx.placedThisStep, {
    stroke: ink,
    alpha: 1,
    inkSaver: !!ctx.inkSaver,
  });

  // ---------- Legend + compass (bottom area, consistent corner) ----------
  const legendY = Math.min(H - bottomMargin + 10, gy + gridH + 18);
  drawLegendCompass(pdf, Mx, legendY, ink);

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

type DrawOpts = { stroke: string; alpha: number; inkSaver?: boolean };

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

    if (opts.inkSaver) {
      // Keylines only (no fill) for cheap home printing
      pdf.rect(fx, fy, size, size, "S");
      continue;
    }

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

/** Draw a wrapping swatch strip; returns bottom Y. Caps rows and adds +N more. */
function drawColorStrip(
  pdf: jsPDF,
  items: Array<{ hex: string; name: string; count: number }>,
  x: number,
  y: number,
  maxW: number,
  maxRows = 2
) {
  const sw = 10;                 // swatch size
  const gap = 6;                 // gap between swatch and text
  const pad = 10;                // extra space after each chip
  const labelSize = 9;           // small text
  const lineH = sw + 3 + labelSize + 2;

  pdf.setFont("Outfit", "normal");
  pdf.setFontSize(labelSize);
  pdf.setTextColor(60);

  let cx = x, cy = y; let rows = 1; let overflow = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const [r, g, b] = rgb(it.hex);
    const label = `${it.name} (${it.count})`;
    const tw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : 90;
    const w = sw + gap + Math.min(tw, 120) + pad; // cap label width to avoid huge chips

    // wrap if this chip would exceed available width
    if (cx + w > x + maxW) {
      rows++;
      if (rows > maxRows) { overflow = items.length - i; break; }
      cx = x; cy += lineH; // next row
    }

    // chip
    pdf.setFillColor(r, g, b); pdf.rect(cx, cy, sw, sw, "F");
    // label (truncate visually if long)
    const maxLabel = 120;
    pdf.text(truncate(pdf, label, maxLabel), cx + sw + gap, cy + sw - 1);

    cx += w;
  }

  if (overflow > 0) {
    const more = `+${overflow} more`;
    const mw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(more) : 40;
    pdf.setTextColor(110); pdf.text(more, x + maxW - mw, cy + sw - 1);
  }

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

function drawLegendCompass(pdf: jsPDF, x: number, y: number, ink: string) {
  // Legend: plate outline + filled cell
  pdf.setFont("Outfit", "normal"); pdf.setFontSize(9); pdf.setTextColor(90);
  const [ir, ig, ib] = rgb(ink);
  // outline box
  pdf.setDrawColor(ir, ig, ib); pdf.setLineWidth(0.6);
  pdf.rect(x, y - 7, 8, 8, "S");
  pdf.text("Plate outline", x + 12, y);
  // filled sample
  pdf.setFillColor(170, 170, 170); pdf.rect(x + 90, y - 7, 8, 8, "FD");
  pdf.text("Filled cell", x + 104, y);

  // Compass (N E S W) boxed
  const compX = x + 200; const compY = y - 9; const cw = 36; const ch = 22;
  pdf.setDrawColor(120); pdf.setLineWidth(0.7); pdf.rect(compX, compY, cw, ch);
  pdf.setFontSize(8); pdf.setTextColor(80);
  pdf.text("N", compX + cw/2 - 2, compY + 7);
  pdf.text("W", compX + 5, compY + ch/2 + 2);
  pdf.text("E", compX + cw - 9, compY + ch/2 + 2);
  pdf.text("S", compX + cw/2 - 2, compY + ch - 4);
}
