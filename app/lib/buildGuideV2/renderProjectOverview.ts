import type jsPDF from "jspdf";
import type { ProjectOverviewCtx, PaletteItem } from "./types";
import { fitRect, hexToRgb, truncatePdf } from "./utils";

export function renderProjectOverview(pdf: jsPDF, ctx: ProjectOverviewCtx) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const M = 40, TITLE_Y = 56, GAP_L = 16, GAP_S = 8, FRAME_PAD = 12;
  const SWATCH = 14, SWATCH_GAP = 6;

  // Title
  pdf.setFont("Outfit", "heavy"); pdf.setTextColor(17); pdf.setFontSize(22);
  pdf.text("Project Overview", M, TITLE_Y);

  // Original image — centered with a light frame
  const IMG_MAX_W = W - 2 * M - 2 * FRAME_PAD;
  const IMG_MAX_H = Math.min(H * 0.33, 280);
  const fitted = fitRect(ctx.originalImgW, ctx.originalImgH, IMG_MAX_W, IMG_MAX_H);
  const imgX = (W - fitted.w) / 2;
  const imgY = TITLE_Y + GAP_L;

  pdf.setDrawColor(229, 231, 235); pdf.setLineWidth(0.6);
  ;(pdf as any).roundedRect?.(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD, 10, 10, "S") || pdf.rect(imgX - FRAME_PAD, imgY - FRAME_PAD, fitted.w + 2 * FRAME_PAD, fitted.h + 2 * FRAME_PAD);
  pdf.addImage(ctx.originalImg, ctx.originalType, imgX, imgY, fitted.w, fitted.h);

  let cursorY = imgY + fitted.h + GAP_L;

  // Stats
  const stats = buildStats(ctx);
  cursorY = drawStatsGrid(pdf, stats, M, cursorY, W - 2 * M);

  // Palette
  cursorY += GAP_L;
  pdf.setFont("Outfit", "bold"); pdf.setFontSize(11); pdf.setTextColor(17);
  pdf.text("Colors used in this build", M, cursorY);

  cursorY += GAP_S;
  layoutPaletteRows(pdf as any, M, cursorY, W - 2 * M, ctx.palette, SWATCH, SWATCH_GAP);
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

function layoutPaletteRows(pdf:any, x:number, y:number, maxW:number, items:PaletteItem[], sw:number, gap:number) {
  const labelFont = 9, rowH = sw + 4 + labelFont + 2;
  const perRow = Math.max(6, Math.min(12, Math.floor((maxW + gap) / (sw + gap))));
  let cx = x, cy = y;
  items.forEach((c, idx) => {
    if (idx>0 && idx%perRow===0) { cy += rowH + 8; cx = x; }
    const [r,g,b] = hexToRgb(c.hex);
    pdf.setFillColor(r,g,b); pdf.rect(cx, cy, sw, sw, "F");
    pdf.setFont("Outfit","normal"); pdf.setTextColor(60); pdf.setFontSize(labelFont);
    pdf.text(truncatePdf(pdf, c.name, sw + 40), cx, cy + sw + 10);
    cx += sw + gap;
  });
  return cy + rowH;
}
