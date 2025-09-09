import jsPDF from "jspdf";
import type { BuildGuideCtx, StepCell } from "./types";
import { registerOutfit } from "./fonts";
import { renderProjectOverview } from "./renderProjectOverview";
import { renderStepPage } from "./renderStepPage";
import { renderBOM } from "./renderBOM";
import { urlToDataURL } from "./utils";

export async function renderBuildGuideV2(ctx: BuildGuideCtx) {
  const pdf = new jsPDF({ unit: "pt", format: (ctx.pageFormat ?? "letter") });

  await registerOutfit(pdf);

  // Page 1 — cover v2 (full-bleed)
  const coverDataUrl = await urlToDataURL("/pdf-templates/cover-v2.png");
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  pdf.addImage(coverDataUrl, "PNG", 0, 0, W, H);

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
