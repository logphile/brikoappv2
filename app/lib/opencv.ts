// OpenCV.js preprocess utilities
// For now, draw the image to an OffscreenCanvas at the exact target size.
export async function preprocessToImageData(bitmap: ImageBitmap, width: number, height: number): Promise<ImageData> {
  const oc = new OffscreenCanvas(width, height)
  const ctx = oc.getContext('2d', { willReadFrequently: true })!
  ;(ctx as any).imageSmoothingEnabled = true
  ;(ctx as any).imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}
