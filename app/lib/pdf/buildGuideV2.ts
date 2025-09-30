import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { registerOutfit } from './fonts'
import { renderOverviewV4 } from './overviewV4'
import { renderStepPage, type StepCell } from './renderStepPage'

export type Ctx = {
  cols:number; rows:number;
  widthIn:number; heightIn:number;
  widthCm:number; heightCm:number;
  totalBricks:number; distinctColors:number; estimateUSD?:number;
  palette: { name:string; hex:string }[];
  originalImg:string; originalType:'PNG'|'JPEG'; originalImgW:number; originalImgH:number;
  steps: StepCell[][]; // array of “this step” cells
  nameFromHex:(hex:string)=>string;
  bom: Array<{ partLabel:string; colorName:string; qty:number; estimate?:number }>;
  inkSaver?: boolean;
}

export async function renderBuildGuideV2(ctx: Ctx) {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' })
  registerOutfit(pdf as any)

  // --- Page 1: Cover (full-bleed with tiny overscan) ---
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  try {
    const ver = (import.meta as any)?.env?.VITE_BUILD_ID ?? Date.now()
    const overscan = 6
    const coverUrl = `/PDF-Cover-Mockup-v2.png?v=${ver}`
    await addImageElement(pdf, coverUrl, 'PNG', -overscan, -overscan, W + overscan*2, H + overscan*2)
  } catch (e) {
    console.warn('[BuildGuide v1] Cover missing or failed to load; continuing without cover', e)
  }

  // --- Page 2: Project Overview (V4 only) ---
  pdf.addPage()
  renderOverviewV4({
    pdf,
    originalImg: ctx.originalImg,
    originalType: ctx.originalType,
    originalImgW: ctx.originalImgW,
    originalImgH: ctx.originalImgH,
    cols: ctx.cols,
    rows: ctx.rows,
    totalBricks: ctx.totalBricks,
    widthIn: Number.isFinite(ctx.widthIn) ? ctx.widthIn.toFixed(1) : String(ctx.widthIn),
    heightIn: Number.isFinite(ctx.heightIn) ? ctx.heightIn.toFixed(1) : String(ctx.heightIn),
    widthCm: Number.isFinite(ctx.widthCm) ? ctx.widthCm.toFixed(1) : String(ctx.widthCm),
    heightCm: Number.isFinite(ctx.heightCm) ? ctx.heightCm.toFixed(1) : String(ctx.heightCm),
    distinctColors: ctx.distinctColors,
    estimateUSD: typeof ctx.estimateUSD === 'number' ? ctx.estimateUSD : 0,
    palette: ctx.palette.map((p, i) => ({ name: p.name, colorId: i, hex: p.hex }))
  })

  // --- Step pages ---
  let placedBefore: StepCell[] = []
  ctx.steps.forEach((placedThisStep, i) => {
    pdf.addPage()
    renderStepPage(pdf as any, {
      stepIndex: i,
      grid: { cols: ctx.cols, rows: ctx.rows },
      placedBefore,
      placedThisStep,
      nameFromHex: ctx.nameFromHex,
      ink: '#111827', gridLight: '#E5E7EB', gridHeavy: '#9CA3AF',
      title: `STEP ${i + 1}`,
      inkSaver: !!ctx.inkSaver
    })
    placedBefore = placedBefore.concat(placedThisStep)
  })

  // --- BOM page ---
  pdf.addPage()
  renderBOM(pdf as any, ctx.bom)

  return pdf
}

function renderBOM(pdf:any, bom: Array<{partLabel:string;colorName:string;qty:number;estimate?:number}>) {
  const M = 40
  pdf.setFont('Outfit','heavy'); pdf.setTextColor(17); pdf.setFontSize(18)
  pdf.text('Bill of Materials', M, 64)

  autoTable(pdf, {
    startY: 84,
    head: [['Part', 'Color', 'Qty', 'Est. $']],
    body: bom.map(r => [r.partLabel, r.colorName, r.qty.toString(), r.estimate!=null ? r.estimate.toFixed(2) : '—']),
    styles: { font: 'Outfit', fontStyle:'normal', fontSize:10, lineColor:[229,231,235], lineWidth:0.25, textColor:[17,24,39] },
    headStyles: { fillColor:[17,24,39], textColor:255, font:'Outfit', fontStyle:'bold' },
    alternateRowStyles: { fillColor:[249,250,251] },
    columnStyles: { 2:{ halign:'right', cellWidth:40 }, 3:{ halign:'right', cellWidth:50 } },
    margin: { left:M, right:M }
  })

  const H = pdf.internal.pageSize.getHeight()
  pdf.setFont('Outfit','normal'); pdf.setFontSize(9); pdf.setTextColor(120)
  pdf.text('Estimated cost varies by seller, region, and color availability. LEGO® is a trademark of the LEGO Group.', M, H - 24)
}

async function addImageElement(pdf:any, src:string, type:'PNG'|'JPEG', x:number, y:number, w:number, h:number){
  const img = new Image()
  const loaded = new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject })
  img.src = src
  await loaded
  pdf.addImage(img, type, x, y, w, h)
}
