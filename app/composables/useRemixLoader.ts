import { ref } from 'vue'

// Unified loader for mosaic/voxel/avatar Remix flows
export function useRemixLoader() {
  const loadingFromSrc = ref(false)

  async function fetchAsFile(url: string, name = 'remix.png') {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
    const blob = await res.blob()
    return new File([blob], name, { type: blob.type || 'image/png' })
  }

  // Call your page's upload/render handler that accepts a File
  async function loadInto(handler: (file: File) => Promise<any>, url?: string | null) {
    if (!url) return
    loadingFromSrc.value = true
    try {
      const file = await fetchAsFile(url)
      await handler(file)
    } finally {
      loadingFromSrc.value = false
    }
  }

  return { loadingFromSrc, loadInto }
}
