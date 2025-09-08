import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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

// Attempt to load Outfit fonts dynamically from a CDN (graceful fallback to built-in fonts)
async function loadOutfitFonts(doc: jsPDF) {
  const URLs = {
    regular: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/outfit/Outfit-Regular.ttf',
    semibold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/outfit/Outfit-SemiBold.ttf',
    extrabold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/outfit/Outfit-ExtraBold.ttf',
  }
  async function fetchBase64(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      // base64 encode
      let binary = ''
      const bytes = new Uint8Array(buf)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
      return btoa(binary)
    } catch {
      return null
    }
  }
  try {
    const [r, b, h] = await Promise.all([
      fetchBase64(URLs.regular),
      fetchBase64(URLs.semibold),
      fetchBase64(URLs.extrabold),
    ])
    if (r) { (doc as any).addFileToVFS('Outfit-Regular.ttf', r); (doc as any).addFont('Outfit-Regular.ttf', 'Outfit', 'normal') }
    if (b) { (doc as any).addFileToVFS('Outfit-SemiBold.ttf', b); (doc as any).addFont('Outfit-SemiBold.ttf', 'Outfit', 'bold') }
    if (h) { (doc as any).addFileToVFS('Outfit-ExtraBold.ttf', h); (doc as any).addFont('Outfit-ExtraBold.ttf', 'Outfit', 'heavy') }
  } catch {
    // ignore
  }
}

async function svgUrlToPngDataUrl(svgUrl: string, width = 96, height = 96): Promise<string | null> {
  try {
    const svgText = await fetch(svgUrl, { mode: 'cors' }).then(r => r.text())
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
    const svgUrlObj = URL.createObjectURL(svgBlob)
    const img = new Image()
    const loaded = new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject })
    img.src = svgUrlObj
    await loaded
    const cvs = document.createElement('canvas')
    cvs.width = width; cvs.height = height
    const ctx = cvs.getContext('2d')!
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(svgUrlObj)
    return cvs.toDataURL('image/png')
  } catch {
    return null
  }
}

async function captureMosaicPreview(): Promise<string | null> {
  try {
    const targetEl = typeof document !== 'undefined' ? document.getElementById('mosaic-preview-capture') : null
    if (!targetEl) return null
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(targetEl as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

function addFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const page = (doc as any).getCurrentPageInfo?.().pageNumber || (doc as any).internal.getNumberOfPages?.()
  doc.setFontSize(9)
  doc.setTextColor(120)
  try { doc.setFont('Outfit', 'normal') } catch {}
  doc.text('briko.app', 40, H - 16)
  doc.text(String(page || ''), W - 40, H - 16, { align: 'right' })
}

function drawGrid(doc: jsPDF, x: number, y: number, cols: number, rows: number, size: number) {
  // Light grid
  doc.setDrawColor(229,231,235)
  doc.setLineWidth(0.2)
  for (let c = 0; c <= cols; c++) {
    const xx = x + c * size
    doc.line(xx, y, xx, y + rows * size)
  }
  for (let r = 0; r <= rows; r++) {
    const yy = y + r * size
    doc.line(x, yy, x + cols * size, yy)
  }
  // Heavier baseplate boundaries (every 16)
  doc.setDrawColor(156,163,175)
  doc.setLineWidth(0.6)
  for (let c = 16; c < cols; c += 16) {
    const xx = x + c * size
    doc.line(xx, y, xx, y + rows * size)
  }
  for (let r = 16; r < rows; r += 16) {
    const yy = y + r * size
    doc.line(x, yy, x + cols * size, yy)
  }
}

function drawCellsRange(doc: jsPDF, x: number, y: number, size: number, grid: (string | null)[][], yStart: number, yEnd: number, alpha = 1) {
  // yEnd inclusive
  const H = grid.length; const W = grid[0]?.length || 0
  // Lighten helper for ghost rows when alpha < 1 and alpha APIs are unavailable
  const lightenRgb = (rgb: [number, number, number], factor = 0.75): [number, number, number] => {
    const [r, g, b] = rgb
    const lr = Math.round(r + (255 - r) * factor)
    const lg = Math.round(g + (255 - g) * factor)
    const lb = Math.round(b + (255 - b) * factor)
    return [lr, lg, lb]
  }
  const hasAlphaApi = !!(doc as any).setFillAlpha
  if (alpha !== 1 && hasAlphaApi) (doc as any).setFillAlpha?.(alpha)
  doc.setLineWidth(0.4)
  for (let rr = Math.max(0, yStart); rr <= Math.min(H - 1, yEnd); rr++) {
    for (let cc = 0; cc < W; cc++) {
      const hex = grid[rr][cc]
      if (!hex) continue
      let [r, g, b] = hexToRgb(hex)
      if (alpha !== 1 && !hasAlphaApi) {
        ;[r, g, b] = lightenRgb([r, g, b], 0.78)
      }
      doc.setFillColor(r, g, b)
      if (alpha === 1) { doc.setDrawColor(17,24,39) } // crisp edge for current row
      doc.rect(x + cc * size, y + rr * size, size, size, 'FD')
    }
  }
  if (alpha !== 1 && hasAlphaApi) { (doc as any).setFillAlpha?.(1); (doc as any).setDrawAlpha?.(1) }
}

export async function exportBuildGuidePDF(opts: {
  bricks: TiledBrick[]
  width: number
  height: number
  fileName?: string
  topSurface?: 'plates'|'tiles'
}) {
  const tileMode = opts.topSurface === 'tiles'
  const { bricks, width, height } = opts
  const fileName = opts.fileName || `briko-build-guide-${tileMode ? 'tiles' : 'plates'}.pdf`
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  await loadOutfitFonts(doc)

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48

  // Cover page
  try {
    // Header bar
    doc.setFillColor(17,24,39)
    doc.rect(0, 0, W, 84, 'F')

    // Logo + Briko
    let logoPng: string | null = null
    try { logoPng = await svgUrlToPngDataUrl('/brand/briko-icon-accent.svg', 128, 128) } catch {}
    const xLogo = M, yLogo = 30, logoW = 24, logoH = 24
    if (logoPng) doc.addImage(logoPng, 'PNG', xLogo, yLogo, logoW, logoH)
    try { doc.setFont('Outfit', 'heavy') } catch {}
    doc.setTextColor(255)
    doc.setFontSize(20)
    doc.text('Briko', xLogo + logoW + 10, yLogo + 17)

    // Title
    try { doc.setFont('Outfit', 'bold') } catch {}
    doc.setTextColor(34)
    doc.setFontSize(22)
    doc.text('Mosaic Build Guide', M, 130)

    // “2D Mosaic” chip on the right
    const chipW = 110, chipH = 26
    doc.setDrawColor(0,229,160); doc.setLineWidth(1.5)
    ;(doc as any).roundedRect?.(W - M - chipW, 110, chipW, chipH, 6, 6, 'S') || doc.rect(W - M - chipW, 110, chipW, chipH)
    try { doc.setFont('Outfit', 'bold') } catch {}
    doc.setTextColor(0,229,160); doc.setFontSize(12)
    doc.text('2D Mosaic', W - M - chipW + 18, 128)

    // Prefer Original image; fallback to mosaic preview capture
    const anyWin: any = (typeof window !== 'undefined') ? window : null
    const originalUrl: string | null = anyWin?.__brikoOriginalDataUrl || null
    let imgUrl = originalUrl
    if (!imgUrl) imgUrl = await captureMosaicPreview()
    if (imgUrl) {
      // Measure intrinsic size
      const image = new Image()
      const loaded = new Promise<void>((res, rej) => { image.onload = () => res(); image.onerror = rej })
      image.src = imgUrl
      await loaded
      const maxW = W - M*2
      const maxH = H * 0.55
      const rImg = image.width / Math.max(1, image.height)
      let drawW = maxW, drawH = drawW / rImg
      if (drawH > maxH) { drawH = maxH; drawW = drawH * rImg }
      const yImg = 170
      // Frame
      doc.setDrawColor(229); doc.setLineWidth(0.5)
      ;(doc as any).roundedRect?.(M, yImg - 8, drawW, drawH + 16, 10, 10, 'S') || doc.rect(M, yImg - 8, drawW, drawH + 16)
      doc.addImage(imgUrl, 'PNG', M + 12, yImg, drawW - 24, drawH - 24)
    }

    // Footer (cover-only branding line)
    try { doc.setFont('Outfit', 'normal') } catch {}
    doc.setTextColor(120); doc.setFontSize(9)
    doc.text('briko.app • Not affiliated with LEGO Group', M, H - 24)
  } catch {}

  // Build a color grid from bricks for progressive fill
  const grid: (string | null)[][] = Array.from({ length: height }, () => Array<string | null>(width).fill(null))
  for (const b of bricks) {
    const hex = legoPalette[b.colorId]?.hex || '#cccccc'
    for (let dy = 0; dy < b.h; dy++) {
      const yy = b.y + dy; if (yy < 0 || yy >= height) continue
      for (let dx = 0; dx < b.w; dx++) {
        const xx = b.x + dx; if (xx < 0 || xx >= width) continue
        grid[yy][xx] = hex
      }
    }
  }

  // Step pages (row-by-row)
  doc.addPage()
  for (let row = 0; row < height; row++) {
    if (row > 0) doc.addPage()
    // Header
    try { doc.setFont('Outfit', 'bold') } catch {}
    doc.setFontSize(16); doc.setTextColor(17)
    doc.text(`Step ${row + 1}`, 40, 50)
    try { doc.setFont('Outfit', 'normal') } catch {}
    doc.setFontSize(10); doc.setTextColor(107)
    const newStarts = bricks.filter(b => b.y === row).length
    doc.text(`New bricks this step: ${newStarts}`, 40, 68)

    // Compute cell size and grid placement
    const top = 90, bottom = 60
    const cell = Math.min((W - M*2) / Math.max(1, width), (H - top - bottom) / Math.max(1, height))
    const gW = cell * width, gH = cell * height
    const gx = (W - gW) / 2
    const gy = top

    // Grid + cells (previous rows ghosted, current row highlighted)
    drawGrid(doc, gx, gy, width, height, cell)
    // previous rows
    drawCellsRange(doc, gx, gy, cell, grid, 0, row - 1, 0.2)
    // current row full
    drawCellsRange(doc, gx, gy, cell, grid, row, row, 1)

    addFooter(doc)
    if (row % 8 === 7) { await new Promise<void>(r => setTimeout(r)) }
  }

  // BOM via autoTable
  doc.addPage()
  try { doc.setFont('Outfit', 'bold') } catch {}
  doc.setFontSize(18); doc.setTextColor(17)
  doc.text('Bill of Materials', 40, 64)
  const { rows, total } = buildBOMWithBuckets(bricks, priceTable as Record<StudSize, number>, legoPalette as any)
  const surfaceLabel = (opts.topSurface === 'tiles') ? 'Tile' : 'Plate'
  autoTable(doc, {
    startY: 80,
    head: [['Part', 'Color', 'Qty', 'Est. $']],
    body: rows.map((r: any) => [
      `${surfaceLabel} ${String(r.part).replace('x','×')}`,
      legoPalette[r.colorId]?.name || `Color ${r.colorId}`,
      String(r.qty),
      (r.estTotal ?? r.estUnitPrice) ? (r.estTotal || r.estUnitPrice).toFixed(2) : '—'
    ]),
    styles: { font: 'Outfit', fontStyle: 'normal', fontSize: 10, lineColor: [229,231,235], lineWidth: 0.25, textColor: [17,24,39] },
    headStyles: { fillColor: [17,24,39], textColor: 255, font: 'Outfit', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249,250,251] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }
  })

  // Totals + disclaimer
  try { doc.setFont('Outfit', 'bold') } catch {}
  doc.setTextColor(17); doc.setFontSize(12)
  const endY = (doc as any).lastAutoTable?.finalY || 110
  doc.text(`Estimated total: $${total.toFixed(2)}`, 40, endY + 10)
  try { doc.setFont('Outfit', 'normal') } catch {}
  doc.setFontSize(9); doc.setTextColor(120)
  const lines = (doc as any).splitTextToSize ? (doc as any).splitTextToSize(PRICE_ESTIMATE_LONG, W - 80) : [PRICE_ESTIMATE_LONG]
  doc.text(lines, 40, endY + 18)
  addFooter(doc)

  doc.save(fileName)
}
