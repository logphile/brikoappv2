import type jsPDF from "jspdf";
import type { ProjectOverviewCtx, PaletteItem } from "./types";
import { fitRect, hexToRgb, truncatePdf } from "./utils";

export function renderProjectOverview(pdf: jsPDF, ctx: ProjectOverviewCtx) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const M = 40, TITLE_Y = 56, GAP_L = 16, GAP_S = 8, FRAME_PAD = 12;
  const IMG_TOP_PAD = 12, IMG_BOTTOM_PAD = 24;

  // Title
  pdf.setFont("Outfit", "heavy"); pdf.setTextColor(17); pdf.setFontSize(22);
  pdf.text("Project Overview", M, TITLE_Y);

  // Original image — centered with a light frame
  const IMG_MAX_W = W - 2 * M - 2 * FRAME_PAD;
  const IMG_MAX_H = Math.min(H * 0.33, 280);
  const fitted = fitRect(ctx.originalImgW, ctx.originalImgH, IMG_MAX_W, IMG_MAX_H);
  const imgX = (W - fitted.w) / 2;
  const imgY = TITLE_Y + GAP_L + IMG_TOP_PAD;

  pdf.setDrawColor(229, 231, 235); pdf.setLineWidth(0.6);
  ;(pdf as any).roundedRect?.(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD, 10, 10, "S") || pdf.rect(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD);
  pdf.addImage(ctx.originalImg, ctx.originalType, imgX, imgY, fitted.w, fitted.h);

  let cursorY = imgY + fitted.h + IMG_BOTTOM_PAD;

  // Stats
  const stats = buildStats(ctx);
  cursorY = drawStatsGrid(pdf, stats, M, cursorY, W - 2 * M);

  // Palette
  cursorY += GAP_L;
  pdf.setFont("Outfit", "bold"); pdf.setFontSize(11); pdf.setTextColor(17);
  pdf.text("Colors used in this build", M, cursorY);

  cursorY += GAP_S;
  layoutPaletteGrid(pdf as any, M, cursorY, W - 2 * M, ctx.palette, 14, 12);
}

function buildStats(ctx: ProjectOverviewCtx) {
  const studs = `${ctx.cols} × ${ctx.rows} studs`;
  const inches = `${ctx.widthIn.toFixed(1)} × ${ctx.heightIn.toFixed(1)} in`;
  const cm = `${ctx.widthCm.toFixed(1)} × ${ctx.heightCm.toFixed(1)} cm`;
  const bricks = `${ctx.totalBricks.toLocaleString()} bricks`;
  const colors = `${ctx.distinctColors} colors`;
  const price = ctx.estimateUSD != null ? `Est. $${ctx.estimateUSD.toFixed(2)}` : undefined;

  const arr = [
    { label: "STUD DIMENSIONS", value: studs },
    { label: "DIMENSIONS (INCHES)", value: inches },
    { label: "DIMENSIONS (CENTIMETERS)", value: cm },
    { label: "TOTAL BRICKS", value: bricks },
    { label: "NUMBER OF COLORS", value: colors },
  ] as Array<{label:string; value:string}>;
  if (price) arr.push({ label: "ESTIMATED PRICE", value: price });
  return arr;
}

function drawStatsGrid(pdf: any, items: Array<{label:string; value:string}>, x:number, y:number, maxW:number) {
  const colGap = 24, labelSize = 9, valueSize = 12, rowGap = 8;
  const colW = (maxW - colGap) / 2;
  const useTwoCols = colW >= 200 && items.length >= 4;
  const perCol = useTwoCols ? Math.ceil(items.length / 2) : items.length;

  // Slightly larger line height for readability if supported
  (pdf as any).setLineHeightFactor?.(1.2);

  for (let i=0; i<items.length; i++) {
    const colIndex = useTwoCols ? (i < perCol ? 0 : 1) : 0;
    const rowIndex = useTwoCols ? (i % perCol) : i;
    const ix = x + colIndex * (colW + colGap);
    const iy = y + rowIndex * (valueSize + rowGap + 14);

    pdf.setFont("Outfit","bold"); pdf.setTextColor(75); pdf.setFontSize(labelSize);
    pdf.text(items[i].label, ix, iy);

    pdf.setFont("Outfit","normal"); pdf.setTextColor(17); pdf.setFontSize(valueSize);
    pdf.text(items[i].value, ix, iy + 12);
  }
  const rows = useTwoCols ? perCol : items.length;
  return y + rows * (valueSize + rowGap + 14);
}

function layoutPaletteGrid(
  pdf: any,
  x: number,
  y: number,
  maxW: number,
  items: PaletteItem[],
  swatchSize = 14,
  gutter = 12
) {
  // Fixed column width prevents label collisions; rows are centered
  const CELL_W = 96; // reserved width per swatch+label
  const LABEL_SIZE = 9;
  const ROW_H = swatchSize + 6 + LABEL_SIZE + 4;

  const perRow = Math.max(5, Math.floor((maxW + gutter) / (CELL_W + gutter)));
  const totalRowW = perRow * CELL_W + (perRow - 1) * gutter;
  const startX = x + Math.max(0, (maxW - totalRowW) / 2);

  pdf.setFont('Outfit', 'normal');
  pdf.setFontSize(LABEL_SIZE);
  pdf.setTextColor(60);

  let cx = startX, cy = y, col = 0;
  items.forEach((c, i) => {
    if (i > 0 && col === perRow) {
      col = 0;
      cx = startX;
      cy += ROW_H;
    }

    const [r, g, b] = hexToRgb(c.hex);
    const swX = cx + (CELL_W - swatchSize) / 2;
    const swY = cy;

    // Swatch
    pdf.setFillColor(r, g, b);
    pdf.rect(swX, swY, swatchSize, swatchSize, 'F');

    // Centered label
    const labelY = swY + swatchSize + 10;
    const labelMax = CELL_W - 4;
    const text = truncatePdf(pdf, c.name, labelMax);
    const centerX = cx + CELL_W / 2;
    pdf.text(text, centerX, labelY, { align: 'center' });

    cx += CELL_W + gutter;
    col += 1;
  });

  return cy + ROW_H;
}
