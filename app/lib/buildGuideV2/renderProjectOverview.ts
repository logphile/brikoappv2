import type jsPDF from "jspdf";
import type { ProjectOverviewCtx, PaletteItem } from "./types";
import { hexToRgb } from "./utils";

export const OVERVIEW_VERSION = 'overview-v2.3';

export function renderProjectOverview(pdf: jsPDF, ctx: ProjectOverviewCtx) {
  // Legacy renderer is deprecated. Use renderOverviewV3 instead.
  throw new Error('Do not call: legacy Overview');
  // page & slab
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 18; // outer page margin
  const slabW = Math.min(pageW - margin * 2, 520); // fixed-ish content width
  const slabX = (pageW - slabW) / 2; // centered slab
  let y = 28;

  // Title (centered)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(22); pdf.setTextColor(20);
  pdf.text('Project Overview', pageW/2, y, { align:'center' });
  y += 10;

  // Hero (framed, centered inside slab)
  const pad = 8;
  const heroH = Math.min((pageH * 0.33), 170);
  const heroW = slabW - pad*2;
  pdf.setDrawColor(220); pdf.setLineWidth(0.6); pdf.setFillColor(255,255,255);
  ;(pdf as any).roundedRect?.(slabX, y, slabW, heroH + pad*2, 6, 6, 'S') || pdf.rect(slabX, y, slabW, heroH + pad*2);

  if (ctx.originalImg) {
    const r = Math.min(heroW / Math.max(1, ctx.originalImgW), heroH / Math.max(1, ctx.originalImgH));
    const dw = Math.floor(ctx.originalImgW * r), dh = Math.floor(ctx.originalImgH * r);
    const dx = slabX + (slabW - dw)/2; // centered within slab
    const dy = y + pad + (heroH - dh)/2;
    pdf.addImage(ctx.originalImg, ctx.originalType, dx, dy, dw, dh, undefined, 'FAST');
  }

  // Visible version tag (bottom-left)
  pdf.setFont('Outfit','bold'); pdf.setFontSize(8); pdf.setTextColor(120);
  const W = pageW, H = pageH;
  pdf.text(OVERVIEW_VERSION, 12, H - 14);

  y += heroH + pad*2 + 12;

  // 2×3 spec grid (left/right within centered slab)
  pdf.setFont('Outfit','normal'); pdf.setFontSize(9); pdf.setTextColor(90);
  const gutter = 24;
  const colW = (slabW - gutter)/2;
  const leftX = slabX;
  const rightX = slabX + colW + gutter;

  const spec = (label:string, value:string, x:number) => {
    pdf.setFont('Outfit','normal'); pdf.setFontSize(8); pdf.setTextColor(100);
    pdf.text(label.toUpperCase(), x, y);
    pdf.setFont('Outfit','bold'); pdf.setFontSize(11); pdf.setTextColor(20);
    pdf.text(value, x, y + 5);
  };

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
  pdf.text('Colors used in this build', W/2, y, { align:'center' });
  y += 8;

  // Wrapped color chips within centered slab
  const chipH = 14, chipGap = 10;
  let cx = slabX, cy = y;

  for (const p of ctx.palette as PaletteItem[]) {
    const sw = 22; // swatch width
    const label = p.name || '';
    pdf.setFont('Outfit','normal'); pdf.setFontSize(10); 
    const labelW = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : 60;
    const chipW = sw + 6 + labelW; // swatch + space + text

    // wrap if exceeding slab
    if (cx + chipW > slabX + slabW) { cx = slabX; cy += chipH + chipGap; }

    // swatch
    const [r, g, b] = hexToRgb(p.hex || '#cccccc');
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

// old helpers removed; using centered slab layout above
