import { jsPDF } from 'jspdf'
import type { TiledBrick, StudSize } from '@/types/mosaic'
import { legoPalette } from '@/lib/palette/lego'
import { buildBOMWithBuckets } from '@/lib/bom'
import priceTable from '@/data/brick_prices.json'
import { PRICE_ESTIMATE_LONG } from '@/lib/disclaimer'

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return [204, 204, 204]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

export async function exportBuildGuidePDF(opts: {
  bricks: TiledBrick[]
  width: number
  height: number
  fileName?: string
}) {
  const { bricks, width, height, fileName = 'briko-build-guide.pdf' } = opts
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 10
  const headerH = 10
  const usableW = pageW - margin * 2

  const cell = Math.min(5, usableW / Math.max(1, width))
  const gridW = cell * width
  const gridH = cell * 1

  // Cover page
  try {
    doc.setFontSize(18)
    doc.text('Briko Mosaic Build Guide', margin, margin + 4)
    // Attempt to include the mosaic preview image of the UI via html2canvas (fallback to __brikoCanvas)
    let dataUrl: string | null = null
    try {
      const anyWin: any = (typeof window !== 'undefined') ? window : null
      const targetEl = typeof document !== 'undefined' ? document.getElementById('mosaic-preview-capture') : null
      if (targetEl) {
        const { default: html2canvas } = await import('html2canvas')
        const canvas = await html2canvas(targetEl as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
        dataUrl = canvas.toDataURL('image/png')
      } else {
        const cvs: any = anyWin && anyWin.__brikoCanvas
        if (cvs && typeof cvs.toDataURL === 'function') {
          dataUrl = cvs.toDataURL('image/png')
        }
      }
    } catch {}
    if (dataUrl) {
      const maxW = usableW
      const maxH = pageH * 0.55
      // Assume square-ish; preserve aspect by sizing to width
      const imgW = maxW
      const imgH = Math.min(maxH, imgW)
      doc.addImage(dataUrl, 'PNG', margin, margin + 10, imgW, imgH)
    }
    // Small original photo (if app provided it on window)
    try {
      const anyWin: any = (typeof window !== 'undefined') ? window : null
      const originalUrl: string | null = anyWin?.__brikoOriginalDataUrl || null
      if (originalUrl) {
        const thumbW = 35, thumbH = 35
        doc.setFontSize(9)
        doc.text('Original', pageW - margin - thumbW, margin + 12)
        doc.addImage(originalUrl, 'PNG', pageW - margin - thumbW, margin + 14, thumbW, thumbH)
      }
    } catch {}
    // Small footer wordmark text
    doc.setFontSize(9)
    doc.text('briko.app', pageW - margin - 22, pageH - margin)
  } catch {}
  // Start steps on a new page
  doc.addPage()

  // Pages: one per layer (row), 0..height-1
  for (let layer = 0; layer < height; layer++) {
    if (layer > 0) doc.addPage()
    doc.setFontSize(12)
    doc.text(`Step ${layer + 1}`, margin, margin)

    // Grid row
    const x0 = margin
    const y0 = margin + headerH
    doc.setDrawColor(200)
    doc.rect(x0, y0, gridW, gridH)
    // vertical lines
    doc.setLineWidth(0.1)
    for (let x = 1; x < width; x++) {
      const xx = x0 + x * cell
      doc.line(xx, y0, xx, y0 + gridH)
    }

    // Dim bricks overlapping this layer, except those starting on this layer
    const overlaps = bricks.filter(b => layer >= b.y && layer < (b.y + b.h))
    const starts = overlaps.filter(b => b.y === layer)
    const others = overlaps.filter(b => b.y !== layer)

    // Utility: lighten a hex color by factor (toward white)
    const lighten = (hex: string, factor = 0.75) => {
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
      let r = 204, g = 204, bb = 204
      if (m) {
        r = parseInt(m[1], 16); g = parseInt(m[2], 16); bb = parseInt(m[3], 16)
      }
      const lr = Math.round(r + (255 - r) * factor)
      const lg = Math.round(g + (255 - g) * factor)
      const lb = Math.round(bb + (255 - bb) * factor)
      return [lr, lg, lb] as [number, number, number]
    }

    // Draw dimmed others first
    for (const b of others) {
      const color = legoPalette[b.colorId]?.hex || '#cccccc'
      const [r, g, bb] = lighten(color, 0.78)
      doc.setFillColor(r, g, bb)
      const bx = x0 + b.x * cell
      const bw = b.w * cell
      const bh = 1 * cell // only current row slice
      doc.rect(bx, y0, bw, bh, 'F')
    }

    // Draw highlighted current starts
    for (const b of starts) {
      const color = legoPalette[b.colorId]?.hex || '#cccccc'
      const [r, g, bb] = hexToRgb(color)
      doc.setFillColor(r, g, bb)
      const bx = x0 + b.x * cell
      // draw only 1-row height for simple row-by-row instruction
      const bw = b.w * cell
      const bh = 1 * cell
      doc.rect(bx, y0, bw, bh, 'F')
      // thin outline
      doc.setDrawColor(40)
      doc.rect(bx, y0, bw, bh)
    }

    // Count
    doc.setFontSize(10)
    doc.text(`New bricks this step: ${starts.length}`, margin, y0 + gridH + 6)

    // Periodically yield to keep UI responsive
    if (layer % 8 === 7) {
      await new Promise<void>(r => setTimeout(r))
    }
  }

  // Final BOM summary page
  doc.addPage()
  doc.setFontSize(14)
  doc.text('Bill of Materials', margin, margin)
  const { rows, total } = buildBOMWithBuckets(bricks, priceTable as Record<StudSize, number>, legoPalette as any)
  doc.setFontSize(10)
  let yy = margin + 6
  doc.text('Part', margin, yy)
  doc.text('Color', margin + 40, yy)
  doc.text('Qty', margin + 70, yy)
  doc.text('Unit $', margin + 90, yy)
  doc.text('Total $', margin + 112, yy)
  yy += 4

  for (const r of rows) {
    if (yy > pageH - margin) { doc.addPage(); yy = margin }
    doc.text(r.part.replace('x','×'), margin, yy)
    const colorName = legoPalette[(r as any).colorId]?.name || `Color ${(r as any).colorId}`
    doc.text(String(colorName), margin + 40, yy)
    doc.text(String(r.qty), margin + 70, yy, { align: 'right' })
    doc.text(r.estUnitPrice.toFixed(2), margin + 100, yy, { align: 'right' })
    doc.text(r.estTotal.toFixed(2), margin + 124, yy, { align: 'right' })
    yy += 4
  }

  doc.setFontSize(12)
  const totalY = Math.min(yy + 6, pageH - margin - 16)
  doc.text(`Estimated total: $${total.toFixed(2)}`, margin, totalY)
  // Disclaimer
  doc.setFontSize(9)
  const lines = (doc as any).splitTextToSize
    ? (doc as any).splitTextToSize(PRICE_ESTIMATE_LONG, usableW)
    : [PRICE_ESTIMATE_LONG]
  doc.text(lines, margin, Math.min(totalY + 8, pageH - margin))

  doc.save(fileName)
}
