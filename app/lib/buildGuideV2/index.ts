import jsPDF from "jspdf";
import type { BuildGuideCtx, StepCell } from "./types";
import { registerOutfit } from "./fonts";
import { renderProjectOverview } from "./renderProjectOverview";
import { renderStepPage } from "./renderStepPage";
import { renderBOM } from "./renderBOM";
import { urlToDataURL } from "./utils";

export async function renderBuildGuideV2(ctx: BuildGuideCtx) {
  const pdf = new jsPDF({ unit: "pt", format: (ctx.pageFormat ?? "letter") });

  // Fonts: show a readable error if fonts fail (won’t stop the world)
  try {
    await registerOutfit(pdf);
  } catch (e) {
    console.warn('[BuildGuide] Outfit font failed to load, falling back:', e);
    // Continue with default jsPDF font
  }

  // Page 1 — cover (full-bleed, with tiny overscan to avoid hairline borders)
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  try {
    const ver = (import.meta as any)?.env?.VITE_BUILD_ID ?? Date.now();
    const coverDataUrl = await urlToDataURL(`/PDF-Cover-Mockup-v2.png?v=${ver}`);
    const overscan = 6; // pts
    pdf.addImage(coverDataUrl, "PNG", -overscan, -overscan, W + overscan * 2, H + overscan * 2);
  } catch (e) {
    console.warn('[BuildGuide] Cover missing or invalid; continuing without cover', e);
  }

  // Page 2 — overview
  pdf.addPage();
  renderProjectOverview(pdf, ctx);

  // Steps
  let placedBefore: StepCell[] = [];
  const totalStepPages = ctx.steps.length;
  ctx.steps.forEach((placedThisStep, i) => {
    pdf.addPage();
    renderStepPage(pdf, {
      stepIndex: i,
      grid: { cols: ctx.cols, rows: ctx.rows },
      placedBefore,
      placedThisStep,
      nameFromHex: ctx.nameFromHex,
      ink: "#111827", gridLight: "#E5E7EB", gridHeavy: "#9CA3AF",
      inkSaver: !!ctx.inkSaver
    });
    // Tiny neutral footer (brand + page numbers)
    drawFooter(pdf, i + 1, totalStepPages);
    placedBefore = placedBefore.concat(placedThisStep);
  });

  // BOM
  pdf.addPage();
  renderBOM(pdf, ctx.bom);

  return pdf;
}

function drawFooter(pdf: jsPDF, page: number, total: number) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 54; // match other exporters' bottom margin
  const y = H - M + 6;
  // separator
  pdf.setDrawColor(230); pdf.setLineWidth(0.5);
  pdf.line(M, y - 16, W - M, y - 16);
  // left brand
  pdf.setFont("Outfit","normal"); pdf.setFontSize(9); pdf.setTextColor(110);
  pdf.text('Briko • briko.app • #brikobuild', M, y);
  // right page numbers (steps only)
  const label = `p. ${page} of ${total}`;
  const tw = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(label) : 0;
  pdf.text(label, W - M - tw, y);
}
