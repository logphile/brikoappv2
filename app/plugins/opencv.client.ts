import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return
  // Only initialize where needed to avoid heavy, error-prone startup.
  const path = location.pathname || ''
  const needsCV = /^\/(voxel|mosaic)(\/|$)/.test(path)
  if (!needsCV) return

  try {
    // Client-only dynamic import of OpenCV
    const mod = await import('@techstark/opencv-js')
    const cv: any = (mod as any).default ?? mod

    // Wait for WASM/runtime to be initialized
    await new Promise<void>((resolve) => {
      try {
        if (cv?.ready && typeof cv.ready.then === 'function') {
          cv.ready.then(() => resolve())
        } else if (cv && 'onRuntimeInitialized' in cv) {
          cv.onRuntimeInitialized = () => resolve()
        } else {
          resolve()
        }
      } catch {
        resolve()
      }
    })

    return { provide: { cv } }
  } catch (e) {
    console.warn('OpenCV disabled (failed to load).', e)
    return
  }
})
