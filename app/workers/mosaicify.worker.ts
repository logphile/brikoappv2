// Lightweight mosaicify worker: analyzes input, picks preset (auto) and outputs a WebP blob preview
// No external deps; designed for fast previews and batch seeding.

// Helper: clamp
function clamp(v:number, lo=0, hi=255){ return v<lo?lo:v>hi?hi:v }

// Convert to grayscale (luminance)
function toGrayscale(img: ImageData): ImageData {
  const out = new ImageData(img.width, img.height)
  const s = img.data, d = out.data
  for (let i=0;i<s.length;i+=4){
    const r=s[i], g=s[i+1], b=s[i+2]
    const y = Math.round(0.299*r + 0.587*g + 0.114*b)
    d[i]=d[i+1]=d[i+2]=y; d[i+3]=255
  }
  return out
}

// Simple global contrast stretch (CLAHE-lite placeholder)
function contrastBoost(img: ImageData): ImageData {
  const out = new ImageData(img.width, img.height)
  const s = img.data, d = out.data
  let min=255, max=0
  for (let i=0;i<s.length;i+=4){ const y = s[i]; if(y<min)min=y; if(y>max)max=y }
  const range = Math.max(1, max-min)
  for (let i=0;i<s.length;i+=4){
    const y = Math.round((s[i]-min)*255/range)
    d[i]=d[i+1]=d[i+2]=y; d[i+3]=255
  }
  return out
}

// Slight saturation boost in-place
function satBoost(img: ImageData, amount=0.2): ImageData {
  const out = new ImageData(img.width, img.height)
  const s = img.data, d = out.data
  for (let i=0;i<s.length;i+=4){
    let r=s[i]/255, g=s[i+1]/255, b=s[i+2]/255
    const max=Math.max(r,g,b), min=Math.min(r,g,b)
    let h=0, sA=max===0?0:(max-min)/max, v=max
    // increase saturation
    sA = Math.max(0, Math.min(1, sA*(1+amount)))
    // simple HSV to RGB reconversion using current hue approximation
    // approximate hue via which channel is max
    if (max===min){ r=g=b=v }
    else {
      if (max===r) h = ((g-b)/(max-min))%6
      else if (max===g) h = (b-r)/(max-min)+2
      else h = (r-g)/(max-min)+4
      const c = v * sA
      const x = c * (1 - Math.abs(((h)%2) - 1))
      let rr=0, gg=0, bb=0
      if (0<=h && h<1){ rr=c; gg=x; bb=0 }
      else if (1<=h && h<2){ rr=x; gg=c; bb=0 }
      else if (2<=h && h<3){ rr=0; gg=c; bb=x }
      else if (3<=h && h<4){ rr=0; gg=x; bb=c }
      else if (4<=h && h<5){ rr=x; gg=0; bb=c }
      else { rr=c; gg=0; bb=x }
      const m = v - c
      r = rr + m; g = gg + m; b = bb + m
    }
    d[i]=clamp(Math.round(r*255)); d[i+1]=clamp(Math.round(g*255)); d[i+2]=clamp(Math.round(b*255)); d[i+3]=255
  }
  return out
}

// Quantize to a small palette using Euclidean RGB distance
function quantizeTo(img: ImageData, palette: number[][]): ImageData {
  const out = new ImageData(img.width, img.height)
  const s = img.data, d = out.data
  for (let i=0;i<s.length;i+=4){
    const r=s[i], g=s[i+1], b=s[i+2]
    let best=0, bestD=1e9
    for (let j=0;j<palette.length;j++){
      const pr=palette[j][0], pg=palette[j][1], pb=palette[j][2]
      const dr=r-pr, dg=g-pg, db=b-pb
      const dist = dr*dr+dg*dg+db*db
      if (dist<bestD){ bestD=dist; best=j }
    }
    const pr=palette[best]
    d[i]=pr[0]; d[i+1]=pr[1]; d[i+2]=pr[2]; d[i+3]=255
  }
  return out
}

// Floyd–Steinberg dithering on RGB
function floydSteinberg(img: ImageData, palette: number[][], strength=1.0): ImageData {
  const w=img.width, h=img.height
  const out = new ImageData(new Uint8ClampedArray(img.data), w, h)
  const data = out.data
  function nearest(r:number,g:number,b:number){
    let bi=0, bd=1e9
    for(let j=0;j<palette.length;j++){
      const pr=palette[j][0], pg=palette[j][1], pb=palette[j][2]
      const dr=r-pr, dg=g-pg, db=b-pb; const dist=dr*dr+dg*dg+db*db
      if(dist<bd){ bd=dist; bi=j }
    }
    const p=palette[bi]; return [p[0],p[1],p[2]] as [number,number,number]
  }
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4
      const oldR=data[i], oldG=data[i+1], oldB=data[i+2]
      const [nr,ng,nb]=nearest(oldR,oldG,oldB)
      data[i]=nr; data[i+1]=ng; data[i+2]=nb
      const errR=(oldR-nr)*strength, errG=(oldG-ng)*strength, errB=(oldB-nb)*strength
      function add(px:number,py:number, fr:number){
        if(px<0||py<0||px>=w||py>=h) return
        const idx=(py*w+px)*4
        data[idx]+=Math.round(errR*fr); data[idx+1]+=Math.round(errG*fr); data[idx+2]+=Math.round(errB*fr)
      }
      add(x+1,y,7/16); add(x-1,y+1,3/16); add(x,y+1,5/16); add(x+1,y+1,1/16)
    }
  }
  return out
}

function scaleTo(img: ImageData, W:number, H:number): ImageData {
  // Draw source at its native size, then resample to W×H without smoothing
  const src = new OffscreenCanvas(img.width, img.height)
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  sctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0)

  const dst = new OffscreenCanvas(W, H)
  const dctx = dst.getContext('2d')!
  dctx.imageSmoothingEnabled = false
  dctx.drawImage(src, 0, 0, img.width, img.height, 0, 0, W, H)
  return dctx.getImageData(0, 0, W, H)
}

function analyze(img: ImageData){
  let sSum=0
  const n = img.width*img.height
  const d = img.data
  for(let i=0;i<d.length;i+=4){
    const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255
    const max=Math.max(r,g,b), min=Math.min(r,g,b)
    const s = max===0 ? 0 : (max-min)/max
    sSum += s
  }
  // Edge density placeholder (constant upper bound); can be improved later
  const edgeDensity = 0.05
  return { meanSat: sSum/n, edgeDensity }
}

import { PALETTE_LINE_ART, PALETTE_PHOTO_POP } from '@/lib/palettes'

function lineArtPipeline(img: ImageData, o:{w:number,h:number}){
  const g = toGrayscale(img)
  const eq = contrastBoost(g)
  const q  = quantizeTo(eq, PALETTE_LINE_ART)
  const d  = floydSteinberg(q, PALETTE_LINE_ART, 0.25)
  return scaleTo(d, o.w, o.h)
}

function photoPopPipeline(img: ImageData, o:{w:number,h:number}){
  const sat = satBoost(img)
  const q   = quantizeTo(sat, PALETTE_PHOTO_POP)
  const d   = floydSteinberg(q, PALETTE_PHOTO_POP, 0.7)
  return scaleTo(d, o.w, o.h)
}

function pickPreset(img: ImageData){
  const { meanSat, edgeDensity } = analyze(img)
  return (meanSat < 0.12 && edgeDensity > 0.04) ? 'line-art' : 'photo'
}

self.onmessage = async (e: MessageEvent) => {
  const { bitmap, options } = e.data as { bitmap: ImageBitmap, options: { w:number, h:number, paletteId: string, mode?: 'auto'|'line-art'|'photo' } }
  const off = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = off.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0)
  const img = ctx.getImageData(0,0, off.width, off.height)
  const mode = (options.mode && options.mode !== 'auto') ? options.mode : pickPreset(img)
  const out = mode === 'line-art' ? lineArtPipeline(img, options) : photoPopPipeline(img, options)

  const c = new OffscreenCanvas(out.width, out.height)
  const cctx = c.getContext('2d')!
  cctx.fillStyle = '#0b1020'; cctx.fillRect(0,0,c.width,c.height)
  cctx.putImageData(out, 0, 0)
  const blob = await c.convertToBlob({ type: 'image/webp', quality: 0.92 })
  ;(self as any).postMessage({ blob, mode, brickCount: options.w*options.h, costEst: 0 })
}
