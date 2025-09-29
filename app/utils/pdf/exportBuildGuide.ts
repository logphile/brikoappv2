import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { jsPDF as JsPdfType } from 'jspdf'
import { diffStep, type StepGrid, type PaletteEntry } from '@/utils/guide/metrics'

const PT_PER_IN = 72
const LETTER = { w: 8.5 * PT_PER_IN, h: 11 * PT_PER_IN }
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
  for (let i = 0; i < opts.steps.length; i++) {
    doc.addPage('letter', 'portrait')
    const prev = i === 0 ? emptyLike(opts.steps[0].grid) : opts.steps[i-1].grid
    const curr = opts.steps[i].grid
    const m = diffStep(prev, curr, opts.palette); m.step = i+1

    // 1) Render the canvas region (DOM snapshot of the step container, not whole app)
    const el = opts.elForStep(i)
    if (opts.inkSaver) el.classList.add('print-ink-saver')
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
      drawFooter(doc)
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

  // active color dots (max 6)
  const MAX_CHIPS = 6
  const startX = right - MAX_CHIPS*22; let cx = startX; const cy = top + 30
  const chips = m.activeColors.slice(0, MAX_CHIPS)
  chips.forEach(ac => {
    const rgb = hexToRgb(ac.hex)
    doc.setFillColor(rgb.r, rgb.g, rgb.b); doc.setDrawColor(230); doc.rect(cx, cy, 12, 12, 'FD')
    doc.setTextColor(60)
    doc.text(String(ac.count), cx + 16, cy + 10)
    cx += 22
  })

  if (m.activeColors.length > MAX_CHIPS) {
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(110)
    const more = `+${m.activeColors.length - MAX_CHIPS} more`
    doc.text(more, right - 60, top + 46)
  }

  // running header (project + date) and page count
  doc.setFontSize(9); doc.setTextColor(110)
  doc.text(`Briko • ${project.title} • ${project.dateStr}`, left, top + 10)
  const pg = `p. ${page} of ${total}`
  const pgw = doc.getTextWidth(pg)
  doc.text(pg, right - pgw, top + 10)
}

function drawFooter(doc: JsPdfType){
  const y = LETTER.h - MARGIN + 6
  doc.setFontSize(9); doc.setTextColor(110)
  doc.text('Share your result — #brikobuild', MARGIN, y)
  // light separator
  doc.setDrawColor(230); doc.setLineWidth(0.5)
  doc.line(MARGIN, y - 16, LETTER.w - MARGIN, y - 16)
}
