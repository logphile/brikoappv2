import type { WorkerIn, WorkerOut, PaletteColor, BomRow, Placement } from '@/types/mosaic'

// ----- Color math (ΔE76 in Lab) -----
function srgbToLab([r,g,b]:number[]){
  const s=[r,g,b].map(v=>{v/=255;return v<=.04045?v/12.92:((v+0.055)/1.055)**2.4})
  const [R,G,B]=s
  const X=R*0.4124564+G*0.3575761+B*0.1804375
  const Y=R*0.2126729+G*0.7151522+B*0.072175
  const Z=R*0.0193339+G*0.1191920+B*0.9503041
  const f=(t:number)=>t>0.008856?Math.cbrt(t):7.787*t+16/116
  const fx=f(X/0.95047), fy=f(Y/1), fz=f(Z/1.08883)
  return [116*fy-16, 500*(fx-fy), 200*(fy-fz)]
}
const dE=(a:number[],b:number[])=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])

// ----- Plate catalog (placeholder prices) -----
const PARTS = [
  { part:'Plate 2×4', w:2, h:4, price:0.12 },
  { part:'Plate 2×3', w:2, h:3, price:0.10 },
  { part:'Plate 2×2', w:2, h:2, price:0.08 },
  { part:'Plate 1×4', w:1, h:4, price:0.06 },
  { part:'Plate 1×3', w:1, h:3, price:0.05 },
  { part:'Plate 1×2', w:1, h:2, price:0.04 },
  { part:'Plate 1×1', w:1, h:1, price:0.03 },
] as const

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const { image, width, height, palette, greedy = true, dither = true } = e.data
  // Draw at target size with high-quality scaling
  const oc = new OffscreenCanvas(width, height)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ;(ctx as any).imageSmoothingEnabled = true
  ;(ctx as any).imageSmoothingQuality = 'high'
  ctx.clearRect(0,0,width,height)
  ctx.drawImage(image, 0, 0, width, height)

  const { data } = ctx.getImageData(0,0,width,height)

  const indexes = new Uint16Array(width*height)
  const counts  = new Uint32Array(palette.length)
  const palLab  = palette.map(p=>srgbToLab(p.rgb))

  if (!dither) {
    // plain quantize
    for (let i=0,px=0; i<data.length; i+=4,px++){
      const lab = srgbToLab([data[i],data[i+1],data[i+2]])
      let k=0, best=1e9
      for (let j=0;j<palLab.length;j++){ const dist=dE(lab,palLab[j]); if(dist<best){best=dist;k=j} }
      indexes[px]=k; counts[k]++
    }
  } else {
    // Floyd–Steinberg dithering (serpentine) on sRGB buffer
    const buf = new Float32Array(data.length); for(let i=0;i<data.length;i++) buf[i]=data[i]
    const W = width, H = height
    for (let y=0; y<H; y++){
      const leftToRight = (y % 2 === 0)
      const xStart = leftToRight ? 0 : W-1
      const xEnd   = leftToRight ? W : -1
      const step   = leftToRight ? 1 : -1
      for (let x=xStart; x!==xEnd; x+=step){
        const o = (y*W + x)*4
        const sr = clamp255(buf[o  ]), sg = clamp255(buf[o+1]), sb = clamp255(buf[o+2])
        // map to nearest palette color
        const lab = srgbToLab([sr,sg,sb])
        let k=0, best=1e9
        for (let j=0;j<palLab.length;j++){ const dist=dE(lab,palLab[j]); if(dist<best){best=dist;k=j} }
        indexes[(y*W)+x]=k; counts[k]++
        const [cr,cg,cb] = palette[k].rgb
        const er = sr-cr, eg = sg-cg, eb = sb-cb

        // distribute error
        const dir = step
        add(buf,W,H, x+dir, y   , er,eg,eb, 7/16)
        add(buf,W,H, x-dir, y+1 , er,eg,eb, 3/16)
        add(buf,W,H, x    , y+1 , er,eg,eb, 5/16)
        add(buf,W,H, x+dir, y+1 , er,eg,eb, 1/16)
      }
    }
  }

  // BOM — singles
  const bomSingles: BomRow[] = palette
    .map((p,i)=>({ part:'Plate 1×1', color_name:p.name, hex:p.hex, qty:counts[i], unit_price:p.price_1x1 }))
    .filter(r=>r.qty>0)
    .map(r=>({ ...r, total_price:+(r.qty*r.unit_price).toFixed(2) }))

  let placements: Placement[] | undefined
  let bomGreedy: BomRow[] | undefined

  if (greedy){
    const used = new Uint8Array(width*height)
    placements = []
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        const i = y*width+x
        if (used[i]) continue
        const color = indexes[i]
        let placed = false
        for(const P of PARTS){
          if (fits(P,x,y,width,height,used,indexes,color)){
            place(P,x,y,width,used)
            placements.push({ x,y,w:P.w,h:P.h,color,part:P.part })
            placed = true; break
          }
        }
        if (!placed){
          used[i]=1
          placements.push({ x,y,w:1,h:1,color,part:'Plate 1×1' })
        }
      }
    }
    const map = new Map<string, BomRow>()
    for(const t of placements){
      const p = palette[t.color]
      const price = PARTS.find(pp=>pp.part===t.part)!.price
      const key = `${t.part}|${p.name}`
      const row = map.get(key) || { part:t.part, color_name:p.name, hex:p.hex, qty:0, unit_price:price, total_price:0 }
      row.qty++; map.set(key,row)
    }
    bomGreedy = Array.from(map.values()).map(r=>({ ...r, total_price:+(r.qty*r.unit_price).toFixed(2) }))
  }

  const out: WorkerOut = { width, height, palette, indexes, bomSingles, placements, bomGreedy }
  ;(self as any).postMessage(out, [out.indexes.buffer])
}

// helpers
function clamp255(n:number){ return Math.max(0, Math.min(255, n)) }
function add(buf:Float32Array,W:number,H:number,x:number,y:number,er:number,eg:number,eb:number,w:number){
  if (x<0||x>=W||y<0||y>=H) return
  const i=(y*W+x)*4; buf[i]+=er*w; buf[i+1]+=eg*w; buf[i+2]+=eb*w
}
function fits(P: { w: number; h: number }, x: number, y: number, w: number, h: number, used: Uint8Array, idx: Uint16Array, color: number) {
  if (x + P.w > w || y + P.h > h) return false
  for (let dy = 0; dy < P.h; dy++) {
    const row = (y + dy) * w
    for (let dx = 0; dx < P.w; dx++) {
      const i = row + (x + dx)
      if (used[i] || idx[i] !== color) return false
    }
  }
  return true
}
function place(P: { w: number; h: number }, x: number, y: number, w: number, used: Uint8Array) {
  for (let dy = 0; dy < P.h; dy++) {
    const row = (y + dy) * w
    used.fill(1, row + x, row + x + P.w)
  }
}
