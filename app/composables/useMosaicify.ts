// Composable to lazily load the lightweight mosaicify worker and produce a WebP preview
// Usage:
//   const { mosaicify } = useMosaicify()
//   const { blob, mode, brickCount, costEst } = await mosaicify(imgElOrBitmap, { w: 48, h: 48, paletteId: 'briko-v1', mode: 'auto' })

let _worker: Worker | null = null

export function useMosaicify(){
  async function ensureWorker(): Promise<Worker> {
    if (_worker) return _worker
    const W = await import('@/workers/mosaicify.worker?worker')
    _worker = new W.default()
    return _worker
  }

  async function mosaicify(image: HTMLImageElement | ImageBitmap, opts: { w:number, h:number, paletteId: string, mode?: 'auto'|'line-art'|'photo' }): Promise<{ blob: Blob, mode: string, brickCount: number, costEst: number }>{
    const worker = await ensureWorker()
    const bitmap = image instanceof ImageBitmap ? image : await createImageBitmap(image)
    return new Promise((resolve, reject) => {
      const onMsg = (e: MessageEvent) => { cleanup(); resolve(e.data) }
      const onErr = (e: any) => { cleanup(); reject(e) }
      const cleanup = () => { worker.removeEventListener('message', onMsg as any); worker.removeEventListener('error', onErr as any) }
      worker.addEventListener('message', onMsg as any)
      worker.addEventListener('error', onErr as any)
      worker.postMessage({ bitmap, options: opts }, [bitmap as any])
    })
  }

  return { mosaicify }
}
