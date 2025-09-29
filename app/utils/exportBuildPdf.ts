// app/utils/exportBuildPdf.ts
// Minimal, dependency-free PDF export using jsPDF.
// Legacy guard: do not use this module anymore. Use the V2 adapter path instead.
throw new Error('[Legacy] app/utils/exportBuildPdf.ts imported. Use app/lib/pdf/buildGuideAdapter.ts (renderBuildGuideV2) instead.')

export type BomRow = { name: string; hex: string; count: number }

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return [153, 153, 153]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

export async function exportBuildPdf(opts: {
  canvas: HTMLCanvasElement
  bom: BomRow[]
  meta: { mode: string; size: string }
  filename?: string
}) {
  if (typeof window === 'undefined') throw new Error('PDF export must run client-side')

  // Dynamic import (Nuxt SSR-safe)
  const mod: any = await import('jspdf')
  const JsPdfCtor: any = (mod?.jsPDF ?? mod?.default ?? mod)

  const pdf = new JsPdfCtor({ unit: 'pt', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Briko Build Guide', 40, 40)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(`Mode: ${opts.meta.mode}`, 40, 60)
  pdf.text(`Size: ${opts.meta.size}`, 40, 76)

  // Preview image
  const dataUrl = opts.canvas.toDataURL('image/png')
  const maxW = pageW - 80
  const maxH = pageH * 0.45
  const scale = Math.min(maxW / opts.canvas.width, maxH / opts.canvas.height)
  const imgW = Math.max(50, opts.canvas.width * scale)
  const imgH = Math.max(50, opts.canvas.height * scale)
  try {
    pdf.addImage(dataUrl, 'PNG', 40, 100, imgW, imgH)
  } catch (e) {
    // still continue with BOM
    // eslint-disable-next-line no-console
    console.warn('[PDF] addImage failed; continuing with BOM', e)
  }

  // BOM
  let y = 100 + imgH + 30
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('Parts (by color)', 40, y)
  y += 12
  pdf.setDrawColor(200)
  pdf.line(40, y, pageW - 40, y)
  y += 8
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  const colNameX = 90
  const colCountX = pageW - 40

  for (const row of opts.bom) {
    if (y > pageH - 40) { pdf.addPage(); y = 40 }
    // swatch
    const [r, g, b] = hexToRgb(row.hex)
    pdf.setFillColor(r, g, b)
    pdf.rect(40, y - 9, 14, 14, 'F')
    pdf.setTextColor(0, 0, 0)
    pdf.text(row.name, colNameX, y)
    pdf.text(String(row.count), colCountX, y, { align: 'right' })
    y += 18
  }

  pdf.save(opts.filename ?? `briko-${Date.now()}.pdf`)
}
