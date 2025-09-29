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
    placedBefore = placedBefore.concat(placedThisStep);
  });

  // BOM
  pdf.addPage();
  renderBOM(pdf, ctx.bom);

  return pdf;
}
