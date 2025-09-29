import type { jsPDF as JsPdfType } from 'jspdf'
import { diffStep, type StepGrid, type PaletteEntry } from '@/utils/guide/metrics'

const PT_PER_IN = 72
const LETTER = { w: 8.5 * PT_PER_IN, h: 11 * PT_PER_IN }

// Snapshot the Overview DOM container if present and place it as page 2
async function renderOverviewPage(doc: JsPdfType) {
  const el = document.getElementById('overview-root') as HTMLElement | null
  if (!el) { console.warn('[PDF Overview] overview-root not found in DOM; skipping overview page'); return }
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' })
  // add a fresh page for the overview
  doc.addPage('letter', 'portrait')
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const maxW = pageW - MARGIN * 2
  const maxH = pageH - MARGIN * 2
  const ratio = Math.min(maxW / canvas.width, maxH / canvas.height)
  const drawW = canvas.width * ratio
  const drawH = canvas.height * ratio
  const x = (pageW - drawW) / 2
  const y = (pageH - drawH) / 2
  doc.addImage(canvas, 'PNG', x, y, drawW, drawH, undefined, 'FAST')
}

function drawLegendWrapped(
  doc: JsPdfType,
  colors: Array<{ name:string; hex:string; count:number }>,
  x: number,
  y: number,
  maxW: number,
  maxRows = 2
){
  const box = 12, gap = 6, pad = 10, lineH = 16
  let cx = x, cy = y, rows = 1, overflow = 0
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(60)
  for (let i = 0; i < colors.length; i++){
    const c = colors[i]
    const label = `${c.name} (${c.count})`
    const tw = doc.getTextWidth(label)
    const w = box + gap + Math.min(tw, 120) + pad
    if (cx + w > x + maxW){
      rows++; if (rows > maxRows){ overflow = colors.length - i; break }
      cx = x; cy += lineH
    }
    const { r,g,b } = hexToRgb(c.hex)
    doc.setFillColor(r,g,b); doc.setDrawColor(220); doc.rect(cx, cy - 10, box, box, 'FD')
    doc.setTextColor(60); doc.text(label.length > 26 ? label.slice(0,25) + '…' : label, cx + box + gap, cy)
    cx += w
  }
  if (overflow > 0){
    const more = `+${overflow} more`
    doc.setFontSize(9); doc.setTextColor(110)
    doc.text(more, x + maxW - doc.getTextWidth(more), cy)
  }
}
const MARGIN = 54 // 0.75in
const HEADER_H = 36
const FOOTER_H = 30

function hexToRgb(hex: string){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) }
}

// --- helpers ---
async function loadDataUrl(url: string): Promise<string> {
  const ver = (import.meta as any)?.env?.VITE_BUILD_ID ?? Date.now()
  const res = await fetch(`${url}?v=${ver}`)
  const blob = await res.blob()
  return await new Promise(resolve => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.readAsDataURL(blob)
  })
}

function drawCover(doc: JsPdfType, imgDataUrl: string, mode: 'bleed'|'safe' = 'bleed'){
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  if (mode === 'bleed'){
    const overscan = 6
    doc.addImage(imgDataUrl, 'PNG', -overscan, -overscan, pageW + overscan*2, pageH + overscan*2)
  } else {
    const margin = MARGIN
    doc.addImage(imgDataUrl, 'PNG', margin, margin, pageW - margin*2, pageH - margin*2)
  }
}

function emptyLike(g: StepGrid): StepGrid { return { w: g.w, h: g.h, cells: new Uint16Array(g.cells.length) } }

export async function exportBuildGuideSteps(opts: {
  elForStep: (i:number) => HTMLElement // container wrapping StepPage (not the whole document)
  steps: Array<{ grid: StepGrid; name?: string }>
  palette: PaletteEntry[]
  project: { title: string; dateStr: string }
  inkSaver?: boolean
  fileName?: string
}){
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const totalPages = opts.steps.length

  // 1) COVER — load and place (non-blocking if missing)
  try {
    const coverDataUrl = await loadDataUrl('/PDF-Cover-Mockup-v2.png')
    drawCover(doc, coverDataUrl, 'bleed')
  } catch (e) {
    console.warn('[PDF Cover] missing or failed to load; exporting without cover', e)
  }

  // 2) STEP PAGES — always add a new page; cover consumed page 1
  // Optional Overview page — if present in DOM as #overview-root, snapshot it as page 2
  try {
    await renderOverviewPage(doc)
  } catch (e) {
    console.warn('[PDF Overview] Skipping overview snapshot:', e)
  }

  // 3) STEP PAGES — always add a new page per step
  for (let i = 0; i < opts.steps.length; i++) {
    doc.addPage('letter', 'portrait')
    const prev = i === 0 ? emptyLike(opts.steps[0].grid) : opts.steps[i-1].grid
    const curr = opts.steps[i].grid
    const m = diffStep(prev, curr, opts.palette); m.step = i+1

    // 1) Render the canvas region (DOM snapshot of the step container, not whole app)
    const el = opts.elForStep(i)
    if (opts.inkSaver) el.classList.add('print-ink-saver')
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' })
    if (opts.inkSaver) el.classList.remove('print-ink-saver')

    // 2) Place snapshot
    const maxW = LETTER.w - MARGIN*2
    const maxH = LETTER.h - (MARGIN + HEADER_H) - (MARGIN + FOOTER_H)
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height)
    const drawW = canvas.width * ratio
    const drawH = canvas.height * ratio
    const x = (LETTER.w - drawW) / 2
    const y = MARGIN + HEADER_H + ((maxH - drawH)/2)

    doc.addImage(canvas, 'PNG', x, y, drawW, drawH, undefined, 'FAST')

    // 3) Vector header/footer overlays (skip on cover by design)
    const isCoverPage = (doc as any).getCurrentPageInfo?.().pageNumber === 1
    if (!isCoverPage) {
      drawHeader(doc, { page: i+1, total: totalPages, project: opts.project, m })
      drawFooter(doc, i+1, totalPages)
    }
  }

  doc.save(opts.fileName || 'briko-build-steps.pdf')
}

function drawHeader(doc: JsPdfType, ctx: {
  page: number; total: number;
  project: { title:string; dateStr:string };
  m: { step:number; placedNow:number; totalPlaced:number; activeColors: Array<{hex:string; count:number; name?:string}> }
}){
  const { page, total, project, m } = ctx
  const top = MARGIN; const left = MARGIN; const right = LETTER.w - MARGIN

  // band line
  doc.setDrawColor(47,48,97); doc.setLineWidth(0.8)
  doc.line(left, top + HEADER_H, right, top + HEADER_H)

  // left: Step
  doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(52,52,52)
  doc.text(`Step ${m.step}`, left, top + 20)

  // right: stats
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(90)
  const stats = `Place now: ${m.placedNow}    •    Total so far: ${m.totalPlaced}`
  const tw = doc.getTextWidth(stats)
  doc.text(stats, right - tw, top + 20)

  // legend (wrapped to rows, excludes stats column width)
  const statsW = tw + 24
  const colors = m.activeColors.map(ac => ({ name: ac.name || ac.hex, hex: ac.hex, count: ac.count }))
  drawLegendWrapped(doc, colors, left, top + 34, (right - left - statsW), 2)

  // running header (project + date) and page count
  doc.setFontSize(9); doc.setTextColor(110)
  doc.text(`Briko • ${project.title} • ${project.dateStr}`, left, top + 10)
  const pg = `p. ${page} of ${total}`
  const pgw = doc.getTextWidth(pg)
  doc.text(pg, right - pgw, top + 10)
}

function drawFooter(doc: JsPdfType, page: number, total: number){
  const y = LETTER.h - MARGIN + 6
  // light separator
  doc.setDrawColor(230); doc.setLineWidth(0.5)
  doc.line(MARGIN, y - 16, LETTER.w - MARGIN, y - 16)
  // left brand
  doc.setFontSize(9); doc.setTextColor(110)
  doc.text('Briko • briko.app • #brikobuild', MARGIN, y)
  // right page numbers
  const pg = `p. ${page} of ${total}`
  const tw = doc.getTextWidth(pg)
  doc.text(pg, LETTER.w - MARGIN - tw, y)
}
