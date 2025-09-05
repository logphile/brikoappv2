export async function imageFileToBuffer(file: File, targetW: number, targetH: number): Promise<{ buffer: ArrayBuffer; width: number; height: number }>{
  const bmp = await createImageBitmap(file)
  return await imageBitmapToBuffer(bmp, targetW, targetH)
}

export async function imageBitmapToBuffer(bmp: ImageBitmap, targetW: number, targetH: number): Promise<{ buffer: ArrayBuffer; width: number; height: number }>{
  // Prefer OffscreenCanvas when available; fallback to HTMLCanvasElement
  const useOffscreen = typeof OffscreenCanvas !== 'undefined'
  if (useOffscreen) {
    const off = new OffscreenCanvas(targetW, targetH)
    const ctx = off.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D
    ;(ctx as any).imageSmoothingEnabled = true
    ;(ctx as any).imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, targetW, targetH)
    ctx.drawImage(bmp as any, 0, 0, targetW, targetH)
    const img = ctx.getImageData(0, 0, targetW, targetH)
    return { buffer: img.data.buffer, width: targetW, height: targetH }
  } else {
    const cvs = document.createElement('canvas')
    cvs.width = targetW; cvs.height = targetH
    const ctx = cvs.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
    ;(ctx as any).imageSmoothingEnabled = true
    ;(ctx as any).imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, targetW, targetH)
    ctx.drawImage(bmp as any, 0, 0, targetW, targetH)
    const img = ctx.getImageData(0, 0, targetW, targetH)
    return { buffer: img.data.buffer, width: targetW, height: targetH }
  }
}
