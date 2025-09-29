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
  inkSaver?: boolean;
};

export function renderStepPage(pdf: jsPDF, ctx: StepPageCtx) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const ink = ctx.ink ?? "#111827";
  const gridLight = ctx.gridLight ?? "#E5E7EB";
  const gridHeavy = ctx.gridHeavy ?? "#9CA3AF";

  const Mx = 40, topHeader = 50, topAfterHeader = 70, bottomMargin = 54;

  // Header band
  pdf.setFont("Outfit","bold"); pdf.setTextColor(17); pdf.setFontSize(16);
  const stepN = (ctx.stepIndex ?? 0) + 1;
  pdf.text(ctx.title ?? `Step ${stepN}`, Mx, topHeader);
  const newCount = ctx.placedThisStep.length;
  const totalCount = ctx.placedBefore.length + ctx.placedThisStep.length;
  pdf.setFont("Outfit","normal"); pdf.setFontSize(10);
  const stats = `Place now: ${newCount}    •    Total so far: ${totalCount}`;
  pdf.text(stats, W - Mx, topHeader, { align: "right" });

  // Active-color strip
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

  drawCells(pdf, gx, gy, cell, ctx.placedBefore, { stroke: ink, alpha: 0.25, inkSaver: !!ctx.inkSaver });
  drawCells(pdf, gx, gy, cell, ctx.placedThisStep, { stroke: ink, alpha: 1, inkSaver: !!ctx.inkSaver });

  // Legend + compass (consistent corner near bottom of grid)
  const legendY = Math.min(H - bottomMargin + 10, gy + gridH + 18);
  drawLegendCompass(pdf as any, Mx, legendY, ink);
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

type DrawOpts = { stroke: string; alpha: number; inkSaver?: boolean };
function drawCells(pdf:any, x:number, y:number, size:number, cells:StepCell[], opts:DrawOpts) {
  const [sr,sg,sb] = hexToRgb(opts.stroke);
  const hasG = (pdf as any).GState && (pdf as any).setGState;
  const gs = hasG ? new (pdf as any).GState({ opacity: opts.alpha }) : null;

  pdf.setLineWidth(0.4); pdf.setDrawColor(sr,sg,sb);
  for (const cell of cells) {
    const fx = x + cell.col * size, fy = y + cell.row * size;
    const [r,g,b] = hexToRgb(cell.colorHex);
    if (opts.inkSaver) {
      // Keylines only for ink saver
      pdf.rect(fx, fy, size, size, "S");
      continue;
    }
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

function drawColorStrip(pdf:any, items: Array<{hex:string; name:string; count:number}>, x:number, y:number, maxW:number, maxRows=2) {
  const sw = 10, gap = 6, pad = 10, labelSize = 9, lineH = sw + 3 + labelSize + 2;
  pdf.setFont("Outfit","normal"); pdf.setFontSize(labelSize); pdf.setTextColor(60);
  let cx = x, cy = y, rows = 1, overflow = 0;
  for (let i=0; i<items.length; i++){
    const it = items[i];
    const [r,g,b] = hexToRgb(it.hex);
    const label = `${it.name} (${it.count})`;
    const tw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : 90;
    const w = sw + gap + Math.min(tw, 120) + pad;
    if (cx + w > x + maxW){
      rows++; if (rows > maxRows){ overflow = items.length - i; break; }
      cx = x; cy += lineH;
    }
    pdf.setFillColor(r,g,b); pdf.rect(cx, cy, sw, sw, "F");
    pdf.text(truncatePdf(pdf, label, 120), cx + sw + gap, cy + sw - 1);
    cx += w;
  }
  if (overflow > 0){
    const more = `+${overflow} more`;
    const mw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(more) : 40;
    pdf.setTextColor(110); pdf.text(more, x + maxW - mw, cy + sw - 1);
  }
  return cy + lineH;
}

function drawLegendCompass(pdf:any, x:number, y:number, ink:string){
  pdf.setFont("Outfit","normal"); pdf.setFontSize(9); pdf.setTextColor(90);
  const [ir,ig,ib] = hexToRgb(ink);
  pdf.setDrawColor(ir,ig,ib); pdf.setLineWidth(0.6); pdf.rect(x, y - 7, 8, 8, "S");
  pdf.text("Plate outline", x + 12, y);
  pdf.setFillColor(170,170,170); pdf.rect(x + 90, y - 7, 8, 8, "FD");
  pdf.text("Filled cell", x + 104, y);
  const compX = x + 200, compY = y - 9, cw = 36, ch = 22;
  pdf.setDrawColor(120); pdf.setLineWidth(0.7); pdf.rect(compX, compY, cw, ch);
  pdf.setFontSize(8); pdf.setTextColor(80);
  pdf.text("N", compX + cw/2 - 2, compY + 7);
  pdf.text("W", compX + 5, compY + ch/2 + 2);
  pdf.text("E", compX + cw - 9, compY + ch/2 + 2);
  pdf.text("S", compX + cw/2 - 2, compY + ch - 4);
}
