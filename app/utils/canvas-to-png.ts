export async function canvasToPngBlob(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob> {
  // OffscreenCanvas path (runtime-checked)
  const maybeConvert = (canvas as any)?.convertToBlob
  if (typeof maybeConvert === 'function') {
    return await maybeConvert.call(canvas, { type: 'image/png' })
  }
  // HTMLCanvasElement path
  return await new Promise<Blob>((resolve, reject) => {
    try {
      (canvas as HTMLCanvasElement).toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))), 'image/png')
    } catch (e) {
      reject(e as any)
    }
  })
}
