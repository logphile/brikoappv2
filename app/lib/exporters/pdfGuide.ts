import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { createApp } from 'vue'
import StepCanvas from '@/components/StepCanvas.client.vue'
import type { WorkerOut, BomRow } from '@/types/mosaic'
import { chunkSteps, bomTotal } from '@/lib/steps'
import { PRICE_ESTIMATE_LONG } from '@/lib/disclaimer'

// Legacy exporter guard: do not use this module.
// If this file is imported anywhere, fail loudly so callers switch to the V2 adapter path.
throw new Error('[Legacy] app/lib/exporters/pdfGuide.ts imported. Use app/lib/pdf/buildGuideAdapter.ts (renderBuildGuideV2) instead.')

export async function exportMosaicPdf(rootEl: HTMLElement, data: WorkerOut, bom: BomRow[], maxPerStep=300) {
  const steps = chunkSteps(data.placements || [], maxPerStep)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 40

  // Cover
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22)
  doc.text('Briko — Mosaic Build Guide', M, 70)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12)
  doc.text(`Size: ${data.width}×${data.height} • Palette: ${data.palette.length} colors`, M, 95)
  doc.text(`Estimated cost: $${bomTotal(bom).toFixed(2)}`, M, 112)
  // Disclaimer (cover)
  doc.setFontSize(9)
  const coverWidth = (doc as any).internal.pageSize.getWidth() - 2*M
  const coverLines = (doc as any).splitTextToSize ? (doc as any).splitTextToSize(PRICE_ESTIMATE_LONG, coverWidth) : [PRICE_ESTIMATE_LONG]
  doc.text(coverLines, M, 130)

  // Snapshot main canvas if available
  const canvas = (window as any).__brikoCanvas as HTMLCanvasElement | undefined
  if (canvas) {
    const scale = Math.min((W-2*M)/canvas.width, 400/canvas.height)
    const tmp = document.createElement('canvas')
    tmp.width = Math.round(canvas.width * scale)
    tmp.height = Math.round(canvas.height * scale)
    const ctx = tmp.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height)
    const dataUrl = tmp.toDataURL('image/png')
    doc.addImage(dataUrl, 'PNG', M, 140, tmp.width, tmp.height)
  }

  // BOM page
  doc.addPage()
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
  doc.text('Bill of Materials', M, 60)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  let y = 86
  for (const r of bom) {
    doc.setFillColor(r.hex); doc.rect(M, y-8, 14, 14, 'F')
    doc.text(`${r.part} — ${r.color_name}`, M+24, y)
    doc.text(`${r.qty} pcs`, W - M - 80, y, { align: 'right' })
    y += 18; if (y > 760) { doc.addPage(); y = 60 }
  }
  doc.setFont('helvetica', 'bold'); const totalText = `Total est. cost: $${bomTotal(bom).toFixed(2)}`
  const totalY = Math.min(y+20, 760)
  doc.text(totalText, M, totalY)
  // Footer disclaimer on BOM page
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  const usableW = (doc as any).internal.pageSize.getWidth() - 2*M
  const lines = (doc as any).splitTextToSize ? (doc as any).splitTextToSize(PRICE_ESTIMATE_LONG, usableW) : [PRICE_ESTIMATE_LONG]
  doc.text(lines, M, Math.min(totalY+16, 790))

  // Step pages — render each step canvas via html2canvas
  for (let i=0; i<steps.length; i++) {
    const step = steps[i]
    // Create temporary DOM to render this step using StepCanvas
    const node = document.createElement('div')
    node.style.width = '800px'; node.style.padding = '16px'; node.style.background = '#0a0f18'
    node.style.color = 'white'
    node.innerHTML = `<div id="step-title" style="font:bold 16px helvetica;margin-bottom:8px">Step ${step.index}/${steps.length}</div>`
    const mount = document.createElement('div'); node.appendChild(mount)
    rootEl.appendChild(node)

    // Mount a StepCanvas for this step
    const app = createApp(StepCanvas, { data, stepItems: step.items, showGrid: true })
    app.mount(mount)

    const shot = await html2canvas(node, { backgroundColor: '#0a0f18', scale: 2 })
    const dataUrl = shot.toDataURL('image/png')

    // cleanup
    app.unmount()
    rootEl.removeChild(node)

    // add to PDF
    doc.addPage()
    const maxW = W - 2*M
    const scale = Math.min(maxW/shot.width, 600/shot.height)
    doc.addImage(dataUrl, 'PNG', M, 80, shot.width*scale, shot.height*scale)
    doc.setFont('helvetica', 'normal'); doc.text(`Place the highlighted plates for this step.`, M, 60)
  }

  doc.save('briko_mosaic_guide.pdf')
}
