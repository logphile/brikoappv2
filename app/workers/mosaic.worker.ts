export interface MosaicJob {
  imageData: ImageData
  settings: { size: number; dithering: boolean }
  palette: Array<{ id: number; name: string; rgb: [number, number, number] }>
}

self.onmessage = (e: MessageEvent<MosaicJob>) => {
  // Placeholder pipeline
  const { /* imageData, settings, palette */ } = e.data
  // 1) dither (optional)
  // 2) map to nearest palette
  // 3) greedy tiler -> BOM
  const result = { mosaicGrid: [], bom: [], estPrice: 0 }
  // @ts-ignore
  self.postMessage(result)
}
export {}
