// Convert image -> heightmap (brightness) -> color index per (x,y,z)
// Columns filled from z=0..h(x,y), using 8-band palette indices (0..7)

self.onmessage = async (e: MessageEvent<{image: ImageBitmap, size:number}>) => {
  const { image, size } = e.data
  const oc = new OffscreenCanvas(size, size)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, size, size)
  const { data } = ctx.getImageData(0,0,size,size)

  const depth = size
  const colors = new Uint8Array(size*size*depth) // index into demo palette (0..7)
  const palLen = 8

  for (let y=0; y<size; y++){
    for (let x=0; x<size; x++){
      const i = (y*size + x)*4
      const r=data[i], g=data[i+1], b=data[i+2]
      const v = Math.round((0.299*r + 0.587*g + 0.114*b))      // brightness 0..255
      const h = Math.max(1, Math.round((v/255) * (depth-1)))    // column height
      const colorIdx = Math.floor((v/255) * (palLen-1))         // 0..7 banding
      for (let z=0; z<h; z++){
        colors[(z*size*size) + (y*size + x)] = colorIdx
      }
    }
  }
  ;(self as any).postMessage({ w:size, h:size, depth, colors }, [colors.buffer])
}
export {}
