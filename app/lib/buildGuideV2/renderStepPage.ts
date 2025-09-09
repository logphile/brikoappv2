import type jsPDF from "jspdf";
import type { StepCell } from "./types";
import { hexToRgb, truncatePdf } from "./utils";

export type StepPageCtx = {
  stepIndex: number;                  // 0-based
  grid: { cols:number; rows:number };
  placedBefore: StepCell[];
  placedThisStep: StepCell[];
  nameFromHex: (hex: string) => string;
  ink?: string; gridLight?: string; gridHeavy?: string;
  title?: string;
};

export function renderStepPage(pdf: jsPDF, ctx: StepPageCtx) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const ink = ctx.ink ?? "#111827";
  const gridLight = ctx.gridLight ?? "#E5E7EB";
  const gridHeavy = ctx.gridHeavy ?? "#9CA3AF";

  const Mx = 40, topHeader = 50, topAfterHeader = 70, bottomMargin = 54;

  // Header
  pdf.setFont("Outfit","bold"); pdf.setTextColor(17); pdf.setFontSize(16);
  const stepN = (ctx.stepIndex ?? 0) + 1;
  pdf.text(ctx.title ?? `Step ${stepN}`, Mx, topHeader);
  const newCount = ctx.placedThisStep.length;
  pdf.setFont("Outfit","normal"); pdf.setFontSize(10);
  pdf.text(`New bricks this step: ${newCount}`, W - Mx, topHeader, { align: "right" });

  // Colors used in this step
  pdf.setFont("Outfit","bold"); pdf.setTextColor(17); pdf.setFontSize(10);
  pdf.text("Colors used in this step:", Mx, topAfterHeader);

  const colors = summarizeColors(ctx.placedThisStep, ctx.nameFromHex);
  const stripBottom = drawColorStrip(pdf, colors, Mx, topAfterHeader + 6, W - 2*Mx);

  // Grid area (bigger)
  const cols = ctx.grid.cols, rows = ctx.grid.rows;
  const gridTop = stripBottom + 10;
  const cell = Math.min((W - 2*Mx) / cols, (H - gridTop - bottomMargin) / rows);
  const gridW = cols * cell, gridH = rows * cell;
  const gx = (W - gridW) / 2, gy = gridTop;

  drawGrid(pdf, gx, gy, cols, rows, cell, gridLight, gridHeavy);

  drawCells(pdf, gx, gy, cell, ctx.placedBefore, { stroke: ink, alpha: 0.25 });
  drawCells(pdf, gx, gy, cell, ctx.placedThisStep, { stroke: ink, alpha: 1 });
}

/* helpers */

function drawGrid(pdf:any, x:number, y:number, cols:number, rows:number, size:number, lightHex:string, heavyHex:string) {
  const [lr,lg,lb] = hexToRgb(lightHex), [hr,hg,hb] = hexToRgb(heavyHex);
  pdf.setDrawColor(lr,lg,lb); pdf.setLineWidth(0.25);
  for (let c=0;c<=cols;c++) pdf.line(x + c*size, y, x + c*size, y + rows*size);
  for (let r=0;r<=rows;r++) pdf.line(x, y + r*size, x + cols*size, y + r*size);
  pdf.setDrawColor(hr,hg,hb); pdf.setLineWidth(0.7);
  for (let c=16;c<cols;c+=16) pdf.line(x + c*size, y, x + c*size, y + rows*size);
  for (let r=16;r<rows;r+=16) pdf.line(x, y + r*size, x + cols*size, y + r*size);
}

type DrawOpts = { stroke: string; alpha: number };
function drawCells(pdf:any, x:number, y:number, size:number, cells:StepCell[], opts:DrawOpts) {
  const [sr,sg,sb] = hexToRgb(opts.stroke);
  const hasG = (pdf as any).GState && (pdf as any).setGState;
  const gs = hasG ? new (pdf as any).GState({ opacity: opts.alpha }) : null;

  pdf.setLineWidth(0.4); pdf.setDrawColor(sr,sg,sb);
  for (const cell of cells) {
    const fx = x + cell.col * size, fy = y + cell.row * size;
    const [r,g,b] = hexToRgb(cell.colorHex);
    if (hasG) (pdf as any).setGState(gs);
    const fr = hasG ? r : Math.round(r + (255 - r) * (1 - opts.alpha));
    const fg = hasG ? g : Math.round(g + (255 - g) * (1 - opts.alpha));
    const fb = hasG ? b : Math.round(b + (255 - b) * (1 - opts.alpha));
    pdf.setFillColor(fr,fg,fb); pdf.rect(fx, fy, size, size, "FD");
  }
  if (hasG) (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
}

function summarizeColors(placements: StepCell[], nameFromHex: (hex:string)=>string) {
  const map = new Map<string, number>();
  for (const p of placements) map.set(p.colorHex, (map.get(p.colorHex) || 0) + 1);
  return [...map.entries()].map(([hex, count]) => ({ hex, name: nameFromHex(hex), count }));
}

function drawColorStrip(pdf:any, items: Array<{hex:string; name:string; count:number}>, x:number, y:number, maxW:number) {
  const sw = 10, gap = 6, labelSize = 9, lineH = sw + 3 + labelSize + 2;
  const blockW = 120; // label area
  const perRow = Math.max(6, Math.min(14, Math.floor((maxW + gap) / (sw + gap + blockW))));
  pdf.setFont("Outfit","normal"); pdf.setFontSize(labelSize); pdf.setTextColor(60);
  let cx = x, cy = y;
  items.forEach((it, idx) => {
    if (idx>0 && idx%perRow===0) { cy += lineH + 6; cx = x; }
    const [r,g,b] = hexToRgb(it.hex);
    pdf.setFillColor(r,g,b); pdf.rect(cx, cy, sw, sw, "F");
    const label = `${it.name} (${it.count})`;
    pdf.text(truncatePdf(pdf, label, blockW), cx + sw + 6, cy + sw - 1);
    cx += sw + gap + blockW;
  });
  return cy + lineH;
}
