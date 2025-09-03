// Utility to run Web Workers with cancellation, debouncing, and progress callbacks
// Usage:
//   const task = createWorkerTask(() => import('@/workers/foo?worker').then(m => new m.default()))
//   const result = await task.run(message, { onProgress: (p) => {}, transfer: [] })
//   task.cancel() // aborts current run

export type WorkerCreateFn = () => Promise<Worker>

export interface WorkerRunOptions {
  onProgress?: (data: any) => void
  transfer?: Transferable[]
  signal?: AbortSignal
  timeoutMs?: number
  // Custom resolver: if provided, resolves when returns true; otherwise resolves on first non-progress message
  resolveWhen?: (data: any) => boolean
}

export function createWorkerTask<TOut = any>(create: WorkerCreateFn) {
  let current: { worker: Worker; abort: AbortController; done: boolean } | null = null
  let seq = 0

  async function run(message: any, opts: WorkerRunOptions = {}): Promise<TOut> {
    // Cancel any in-flight worker
    if (current) {
      try { current.abort.abort() } catch {}
      try { current.worker.terminate() } catch {}
      current = null
    }
    const id = ++seq
    const abort = new AbortController()
    const worker = await create()
    current = { worker, abort, done: false }

    const { onProgress, transfer, signal, timeoutMs, resolveWhen } = opts

    // Handlers will be assigned within the Promise closure so cleanup can access them
    let msgHandler: ((e: MessageEvent<any>) => void) | null = null
    let errHandler: ((e: any) => void) | null = null

    const cleanup = () => {
      try { if (msgHandler) worker.removeEventListener('message', msgHandler) } catch {}
      try { if (errHandler) worker.removeEventListener('error', errHandler) } catch {}
      try { worker.terminate() } catch {}
      if (current && current.worker === worker) current = null
    }

    const resolveDefault = (data: any) => {
      // Default: resolve on first non-progress message
      return !(data && typeof data === 'object' && data.type === 'progress')
    }

    let timeoutHandle: any

    const p = new Promise<TOut>((resolve, reject) => {
      const onAbort = () => {
        try { cleanup() } catch {}
        const err = new DOMException('Aborted', 'AbortError')
        ;(err as any).name = 'AbortError'
        reject(err)
      }

      current!.abort.signal.addEventListener('abort', onAbort, { once: true })
      if (signal) signal.addEventListener('abort', () => current && current.abort.abort(), { once: true })
      if (typeof timeoutMs === 'number' && timeoutMs > 0) {
        timeoutHandle = setTimeout(() => current && current.abort.abort(), timeoutMs)
      }

      const onMsg = (e: MessageEvent<any>) => {
        const data = e.data
        if (data && typeof data === 'object') {
          if (data.type === 'progress') {
            onProgress && onProgress(data)
            return
          }
          if (data.type === 'error') {
            cleanup()
            reject(new Error(data.message || 'Worker error'))
            return
          }
        }
        // Final message based on resolver
        const doneNow = (resolveWhen || resolveDefault)(data)
        if (doneNow) {
          cleanup()
          resolve(data as TOut)
        }
      }

      const onErr = (err: any) => {
        // Ignore if aborted
        if (current?.abort.signal.aborted) return
        cleanup()
        reject(err instanceof Error ? err : new Error(String(err)))
      }

      msgHandler = onMsg
      errHandler = onErr
      worker.addEventListener('message', msgHandler)
      worker.addEventListener('error', errHandler)

      try {
        if (transfer && transfer.length) worker.postMessage(message, transfer)
        else worker.postMessage(message)
      } catch (e) {
        cleanup()
        reject(e as any)
      }
    })

    try {
      return await p
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      // ensure cleaned
      try { cleanup() } catch {}
      if (seq === id) current = null
    }
  }

  function cancel() {
    if (!current) return
    try { current.abort.abort() } catch {}
    try { current.worker.terminate() } catch {}
    current = null
  }

  return { run, cancel }
}
