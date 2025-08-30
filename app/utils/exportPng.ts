export function exportPng(canvas: HTMLCanvasElement, filename = 'brickmoc.png') {
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
