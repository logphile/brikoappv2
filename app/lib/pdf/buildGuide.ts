import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { legoPalette } from '@/lib/palette/lego'
import { buildBOMWithBuckets } from '@/lib/bom'
import priceTable from '@/data/brick_prices.json'
import { PRICE_ESTIMATE_LONG } from '@/lib/disclaimer'
import { renderProjectOverview as renderProjectOverviewV2 } from '@/lib/pdf/renderProjectOverview'

// Types kept light to avoid cross-file drift
export type BuildGuideOpts = {
  bricks: Array<{ x:number; y:number; w:number; h:number; colorId:number; part?: string }>
  width: number
  height: number
  fileName?: string
  topSurface?: 'plates' | 'tiles'
  format?: 'a4' | 'letter'
}

// ----- helpers -----
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return [204, 204, 204]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function fitRect(srcW: number, srcH: number, maxW: number, maxH: number) {
  const r = srcW / Math.max(1, srcH)
  let w = maxW, h = w / r
  if (h > maxH) { h = maxH; w = h * r }
  return { w, h }
}

// Register Outfit fonts once per document (CDN base64, offline-safe when cached)
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
      let binary = ''
      const bytes = new Uint8Array(buf)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
      return btoa(binary)
    } catch { return null }
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
  } catch {}
}

async function imageUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result))
      fr.onerror = reject
      fr.readAsDataURL(blob)
    })
  } catch { return null }
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
  } catch { return null }
}

async function captureMosaicPreview(): Promise<string | null> {
  try {
    const targetEl = typeof document !== 'undefined' ? document.getElementById('mosaic-preview-capture') : null
    if (!targetEl) return null
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(targetEl as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    return canvas.toDataURL('image/png')
  } catch { return null }
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
  // Thin grid (≈0.25pt)
  doc.setDrawColor(229,231,235)
  doc.setLineWidth(0.09)
  for (let c = 0; c <= cols; c++) {
    const xx = x + c * size
    doc.line(xx, y, xx, y + rows * size)
  }
  for (let r = 0; r <= rows; r++) {
    const yy = y + r * size
    doc.line(x, yy, x + cols * size, yy)
  }
  // Baseplate boundaries every 16 (≈0.7pt)
  doc.setDrawColor(156,163,175)
  doc.setLineWidth(0.25)
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
  const H = grid.length; const W = grid[0]?.length || 0
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
      if (alpha !== 1 && !hasAlphaApi) { [r, g, b] = lightenRgb([r, g, b], 0.78) }
      doc.setFillColor(r, g, b)
      if (alpha === 1) { doc.setDrawColor(17,24,39) }
      doc.rect(x + cc * size, y + rr * size, size, size, 'FD')
    }
  }
  if (alpha !== 1 && hasAlphaApi) { (doc as any).setFillAlpha?.(1); (doc as any).setDrawAlpha?.(1) }
}

export function layoutPaletteRows(doc: jsPDF, x: number, y: number, maxW: number, items: {name:string;hex:string}[], sw=14, gap=6) {
  const labelH = 10, rowH = sw + 4 + labelH
  let cx = x, cy = y
  const perRow = Math.max(6, Math.floor((maxW + gap)/(sw + gap)))
  items.forEach((c, i) => {
    if (i && i % perRow === 0) { cy += rowH + 8; cx = x }
    const [r,g,b] = hexToRgb(c.hex)
    doc.setFillColor(r,g,b); doc.rect(cx, cy, sw, sw, 'F')
    try { doc.setFont('Outfit','normal') } catch {}
    doc.setTextColor(60); doc.setFontSize(9)
    doc.text(c.name, cx, cy + sw + 10)
    cx += sw + gap
  })
  return cy + rowH
}

function nameFromHex(hex: string): string {
  const e = Object.values(legoPalette as any).find((c: any) => c.hex?.toLowerCase() === hex.toLowerCase()) as any
  return e?.name || hex
}

function buildGridFromBricks(bricks: Array<{x:number;y:number;w:number;h:number;colorId:number}>, w: number, h: number) {
  const grid: (string | null)[][] = Array.from({ length: h }, () => Array<string | null>(w).fill(null))
  for (const b of bricks) {
    const hex = (legoPalette as any)[b.colorId]?.hex || '#cccccc'
    for (let dy = 0; dy < b.h; dy++) {
      const yy = b.y + dy; if (yy < 0 || yy >= h) continue
      for (let dx = 0; dx < b.w; dx++) {
        const xx = b.x + dx; if (xx < 0 || xx >= w) continue
        grid[yy][xx] = hex
      }
    }
  }
  return grid
}

function colorsForStep(bricksStartingThisRow: Array<{ colorId: number }>) {
  const map = new Map<string, number>() // hex -> count
  for (const b of bricksStartingThisRow) {
    const hex = (legoPalette as any)[b.colorId]?.hex || '#cccccc'
    map.set(hex, 1 + (map.get(hex) || 0))
  }
  return [...map.entries()].map(([hex, count]) => ({ hex, name: `${nameFromHex(hex)} (${count})`, count }))
}

// ----- Renderers -----
export async function renderCoverV2(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  // Expect asset at /public/pdf-templates/cover-v2.png
  const cover = await imageUrlToDataUrl('/pdf-templates/cover-v2.png')
  if (cover) {
    doc.addImage(cover, 'PNG', 0, 0, W, H)
  }
}

async function renderProjectOverviewOld(doc: jsPDF, ctx: { width:number; height:number; bricks: any[]; topSurface?: 'plates'|'tiles'; bomRows: any[]; estTotal: number }) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 40

  // Title
  try { doc.setFont('Outfit','heavy') } catch {}
  doc.setTextColor(17,24,39); doc.setFontSize(22)
  doc.text('Project Overview', M, 50)

  // Original image (centered)
  // Prefer original uploaded image; fallback to captured preview
  const anyWin: any = (typeof window !== 'undefined') ? window : null
  let imgUrl: string | null = anyWin?.__brikoOriginalDataUrl || null
  if (!imgUrl) imgUrl = await captureMosaicPreview()
  if (imgUrl) {
    const image = new Image()
    const loaded = new Promise<void>((res, rej) => { image.onload = () => res(); image.onerror = rej })
    image.src = imgUrl
    await loaded
    const maxW = (W - 2*M)
    const maxH = H * 0.35
    const fitted = fitRect(image.width, image.height, maxW, maxH)
    const x = (W - fitted.w) / 2
    const y = 66 + (maxH - fitted.h) / 2
    // Frame with light border + radius (~1px)
    doc.setDrawColor(229,231,235); doc.setLineWidth(0.26)
    ;(doc as any).roundedRect?.(x - 2, y - 2, fitted.w + 4, fitted.h + 4, 10, 10, 'S') || doc.rect(x - 2, y - 2, fitted.w + 4, fitted.h + 4)
    doc.addImage(imgUrl, 'PNG', x, y, fitted.w, fitted.h)
  }

  // Stats block
  const widthIn = ctx.width * 0.315
  const heightIn = ctx.height * 0.315
  const widthCm = ctx.width * 0.8
  const heightCm = ctx.height * 0.8
  const totalBricks = ctx.bomRows.reduce((sum: number, r: any) => sum + Number(r.qty || 0), 0)
  const distinctColors = new Set(ctx.bomRows.map((r: any) => r.colorId ?? r.color_id)).size

  const statsY0 = 66 + (H * 0.35) + 26
  const colGap = 28
  const colW = (W - 2*M - colGap) / 2
  const leftX = M
  const rightX = M + colW + colGap
  const rows = [
    { label: 'STUDS', value: `${ctx.width} × ${ctx.height} studs` },
    { label: 'INCHES', value: `${widthIn.toFixed(1)} × ${heightIn.toFixed(1)} in` },
    { label: 'CENTIMETERS', value: `${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm` },
    { label: 'TOTAL BRICKS', value: String(totalBricks) },
    { label: 'COLORS', value: String(distinctColors) },
    { label: 'ESTIMATED PRICE', value: (isFinite(ctx.estTotal) ? `$${ctx.estTotal.toFixed(2)}` : '—') },
  ]
  let sy = statsY0
  try { doc.setFont('Outfit','bold') } catch {}
  doc.setFontSize(10); doc.setTextColor(17,24,39)
  for (let i = 0; i < rows.length; i++) {
    const { label, value } = rows[i]
    const cx = i < 3 ? leftX : rightX
    const rowIndex = i % 3
    const y = sy + rowIndex * 28
    // label
    try { doc.setFont('Outfit','bold') } catch {}
    doc.setFontSize(10); doc.setTextColor(17,24,39)
    doc.text(label, cx, y)
    // value
    try { doc.setFont('Outfit','normal') } catch {}
    doc.setFontSize(12); doc.setTextColor(17,24,39)
    doc.text(value, cx, y + 12)
  }

  // Palette rows (tidy, wrapped)
  const uniqueColorIds = Array.from(new Set(ctx.bomRows.map((r: any) => r.colorId ?? r.color_id))) as number[]
  const paletteItems = uniqueColorIds.map(id => ({ name: (legoPalette as any)[id]?.name || `Color ${id}`, hex: (legoPalette as any)[id]?.hex || '#ccc' }))
  const paletteTop = statsY0 + 3*28 + 24
  layoutPaletteRows(doc, M, paletteTop, W - 2*M, paletteItems, 14, 6)
}

export function renderStep(doc: jsPDF, step: { index: number; total: number; grid: (string|null)[][]; width:number; height:number; bricksThisStep: Array<{ colorId:number }>; }) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const Mx = 40, top = 70, bottom = 54

  // Header
  try { doc.setFont('Outfit','bold') } catch {}
  doc.setFontSize(16); doc.setTextColor(17,24,39)
  doc.text(`STEP ${step.index}`, Mx, 48)
  const newCount = step.bricksThisStep.length
  try { doc.setFont('Outfit','normal') } catch {}
  doc.setFontSize(10); doc.setTextColor(17,24,39)
  doc.text(`New bricks this step: ${newCount}`, W - Mx, 48, { align: 'right' })

  // Colors used in this step
  const colors = colorsForStep(step.bricksThisStep)
  try { doc.setFont('Outfit','bold') } catch {}
  doc.setFontSize(10); doc.setTextColor(17,24,39)
  doc.text('Colors used in this step:', Mx, 58)
  const paletteBottomY = layoutPaletteRows(doc, Mx, 62, W - 2*Mx, colors, 10, 6)

  // Grid
  const dynTop = Math.max(top, paletteBottomY + 6)
  const cell = Math.min((W - 2*Mx)/step.width, (H - dynTop - bottom)/step.height)
  const gx = (W - step.width*cell)/2
  const gy = dynTop
  drawGrid(doc, gx, gy, step.width, step.height, cell)
  // Previous rows ghosted
  drawCellsRange(doc, gx, gy, cell, step.grid, 0, (step.index - 2), 0.2)
  // Current row highlighted
  drawCellsRange(doc, gx, gy, cell, step.grid, (step.index - 1), (step.index - 1), 1)

  addFooter(doc)
}

export function renderBOM(doc: jsPDF, rows: any[], opts: { surface: 'plates'|'tiles'; estTotal: number }) {
  const W = doc.internal.pageSize.getWidth()
  const M = 40
  try { doc.setFont('Outfit','heavy') } catch {}
  doc.setFontSize(18); doc.setTextColor(17,24,39)
  doc.text('Bill of Materials', M, 64)
  const surfaceLabel = (opts.surface === 'tiles') ? 'Tile' : 'Plate'
  autoTable(doc, {
    startY: 80,
    head: [['Part', 'Color', 'Qty', 'Est. $']],
    body: rows.map((r: any) => [
      `${surfaceLabel} ${String(r.part).replace('x','×')}`,
      (legoPalette as any)[r.colorId]?.name || `Color ${r.colorId}`,
      String(r.qty),
      (r.estTotal ?? r.estUnitPrice) ? (r.estTotal || r.estUnitPrice).toFixed(2) : '—'
    ]),
    styles: { font: 'Outfit', fontStyle: 'normal', fontSize: 10, lineColor: [229,231,235], lineWidth: 0.25, textColor: [17,24,39], cellPadding: 6 },
    headStyles: { fillColor: [17,24,39], textColor: 255, font: 'Outfit', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249,250,251] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }
  })
  // Totals + disclaimer
  try { doc.setFont('Outfit','bold') } catch {}
  doc.setTextColor(17,24,39); doc.setFontSize(12)
  const endY = (doc as any).lastAutoTable?.finalY || 110
  doc.text(`Estimated total: $${opts.estTotal.toFixed(2)}`, M, endY + 10)
  try { doc.setFont('Outfit','normal') } catch {}
  doc.setFontSize(9); doc.setTextColor(120)
  const usableW = W - 2*M
  const lines = (doc as any).splitTextToSize ? (doc as any).splitTextToSize(PRICE_ESTIMATE_LONG, usableW) : [PRICE_ESTIMATE_LONG]
  doc.text(lines, M, endY + 18)
  addFooter(doc)
}

// ----- Orchestrator -----
export async function exportBuildGuidePDF(opts: BuildGuideOpts) {
  const tileMode = opts.topSurface === 'tiles'
  const { bricks, width, height } = opts
  const fileName = opts.fileName || `briko-build-guide-${tileMode ? 'tiles' : 'plates'}.pdf`
  const doc = new jsPDF({ unit: 'mm', format: opts.format || 'a4', compress: true })
  await loadOutfitFonts(doc)

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Precompute BOM summary
  const bom = buildBOMWithBuckets(bricks as any, priceTable as any, legoPalette as any)
  const rows = (bom as any).rows || []
  const estTotal = (bom as any).total || 0

  // Page 1: full-bleed cover image
  await renderCoverV2(doc)

  // Page 2: Project Overview
  doc.addPage()
  // Build context for drop-in renderProjectOverview
  let originalImg: string | null = null
  let originalType: 'PNG' | 'JPEG' = 'PNG'
  let originalImgW = 0
  let originalImgH = 0
  try {
    const anyWin: any = (typeof window !== 'undefined') ? window : null
    originalImg = anyWin?.__brikoOriginalDataUrl || null
    if (!originalImg) originalImg = await captureMosaicPreview()
    if (originalImg) {
      // Detect type from data URL
      if (originalImg.startsWith('data:image/jpeg') || originalImg.startsWith('data:image/jpg')) originalType = 'JPEG'
      else originalType = 'PNG'
      const image = new Image()
      const loaded = new Promise<void>((res, rej) => { image.onload = () => res(); image.onerror = rej })
      image.src = originalImg
      await loaded
      originalImgW = image.width
      originalImgH = image.height
    }
  } catch {}

  const widthIn = width * 0.315
  const heightIn = height * 0.315
  const widthCm = width * 0.8
  const heightCm = height * 0.8
  const totalBricks = rows.reduce((sum: number, r: any) => sum + Number(r.qty || 0), 0)
  const distinctColorIds = Array.from(new Set(rows.map((r: any) => r.colorId))) as number[]
  const paletteItems = distinctColorIds.map(id => ({ name: (legoPalette as any)[id]?.name || `Color ${id}`, hex: (legoPalette as any)[id]?.hex || '#ccc' }))

  if (originalImg && originalImgW && originalImgH) {
    renderProjectOverviewV2(doc as any, {
      cols: width,
      rows: height,
      widthIn,
      heightIn,
      widthCm,
      heightCm,
      totalBricks,
      distinctColors: distinctColorIds.length,
      estimateUSD: estTotal,
      palette: paletteItems,
      originalImg,
      originalType,
      originalImgW,
      originalImgH,
    })
  } else {
    // Fallback to previous internal implementation if we failed to prepare the original image
    await renderProjectOverviewOld(doc, { width, height, bricks, topSurface: opts.topSurface, bomRows: rows, estTotal })
  }
  addFooter(doc)

  // Build grid for step pages
  const grid = buildGridFromBricks(bricks, width, height)

  // Step pages: one per row (ghost previous, highlight current)
  for (let row = 0; row < height; row++) {
    doc.addPage()
    const bricksThisStep = bricks.filter(b => b.y === row)
    renderStep(doc, { index: row + 1, total: height, grid, width, height, bricksThisStep })
    if (row % 8 === 7) { await new Promise<void>(r => setTimeout(r)) }
  }

  // BOM page
  doc.addPage()
  renderBOM(doc, rows, { surface: opts.topSurface || 'plates', estTotal })

  doc.save(fileName)
}
