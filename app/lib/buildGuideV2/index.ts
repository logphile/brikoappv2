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

  // Page 1 — cover v2 (full-bleed)
  let coverDataUrl: string | null = null;
  try {
    coverDataUrl = await urlToDataURL("/pdf-templates/cover-v2.png");
  } catch (e) {
    throw new Error('Cover image "/pdf-templates/cover-v2.png" not found; place a 300-dpi PNG there.');
  }
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  if (coverDataUrl) {
    try {
      pdf.addImage(coverDataUrl, "PNG", 0, 0, W, H);
    } catch (e) {
      throw new Error('Cover image is not a valid PNG (got HTML/404 instead).');
    }
  }

  // Page 2 — overview
  pdf.addPage();
  renderProjectOverview(pdf, ctx);

  // Steps
  let placedBefore: StepCell[] = [];
  ctx.steps.forEach((placedThisStep, i) => {
    pdf.addPage();
    renderStepPage(pdf, {
      stepIndex: i,
      grid: { cols: ctx.cols, rows: ctx.rows },
      placedBefore,
      placedThisStep,
      nameFromHex: ctx.nameFromHex,
      ink: "#111827", gridLight: "#E5E7EB", gridHeavy: "#9CA3AF"
    });
    placedBefore = placedBefore.concat(placedThisStep);
  });

  // BOM
  pdf.addPage();
  renderBOM(pdf, ctx.bom);

  return pdf;
}
