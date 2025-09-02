import { defineStore } from 'pinia'
import type { MosaicSettings, TiledBrick, TilingResult, StudSize } from '@/types/mosaic'
import { MosaicSettingsSchema } from '@/schemas/mosaic'
import { buildBOM } from '@/lib/bom'
import priceTable from '@/data/brick_prices.json'
import { downloadBomCsvWeek1, downloadPng } from '@/lib/exporters'

export type Status = 'idle' | 'quantized' | 'tiling' | 'tiled' | 'error'

const DEFAULT_PARTS: StudSize[] = [
  '2x4','2x3','2x2','1x4','1x3','1x2','1x1'
]

export const useMosaicStore = defineStore('mosaic', {
  state: () => ({
    // quantized grid
    grid: null as Uint16Array | null,
    width: 0,
    height: 0,
    // layers visibility (stud rows)
    visibleLayers: 0,

    // settings
    settings: {
      width: 128,
      height: 128,
      allowedParts: DEFAULT_PARTS.slice(),
      snapOrientation: 'both' as const,
    } as MosaicSettings,

    // tiling streaming
    overlayBricks: [] as TiledBrick[],
    coveragePct: 0,

    // final
    tilingResult: null as TilingResult | null,
    status: 'idle' as Status,
  }),

  actions: {
    setTargetSize(w: number, h: number) {
      this.settings.width = w; this.settings.height = h
      if (this.width && this.height && (this.width !== w || this.height !== h)) {
        // grid dims no longer match target
        this.grid = null
        this.status = 'idle'
      }
    },

    setAllowedParts(parts: StudSize[]) {
      this.settings.allowedParts = parts.length ? parts : DEFAULT_PARTS.slice()
    },

    setVisibleLayers(n: number) {
      const max = this.height || n || 1
      this.visibleLayers = Math.min(Math.max(1, Math.floor(n)), max)
    },

    setGrid(indexes: Uint16Array, width: number, height: number) {
      this.grid = indexes; this.width = width; this.height = height
      this.visibleLayers = height
      this.status = 'quantized'
    },

    async runGreedyTiling() {
      if (!this.grid || !this.width || !this.height) return
      const parsed = MosaicSettingsSchema.safeParse(this.settings)
      if (!parsed.success) {
        this.status = 'error'
        console.error('Invalid settings', parsed.error)
        return
      }

      this.overlayBricks = []
      this.coveragePct = 0
      this.tilingResult = null
      this.status = 'tiling'

      const mod = await import('@/workers/greedyTiler?worker')
      const worker: Worker = new (mod as any).default()

      const handler = (e: MessageEvent) => {
        const data: any = e.data
        if (data.type === 'progress') {
          this.overlayBricks.push(...data.bricksPartial as TiledBrick[])
          this.coveragePct = data.coveragePct
        } else if (data.type === 'done') {
          const bricks = data.bricks as TiledBrick[]
          const { rows, total } = buildBOM(bricks, priceTable as any)
          this.tilingResult = { bricks, bom: rows, estTotalCost: total }
          this.status = 'tiled'
          worker.removeEventListener('message', handler)
          worker.terminate()
        }
      }
      worker.addEventListener('message', handler)

      worker.postMessage({
        grid: this.grid,
        width: this.width,
        height: this.height,
        settings: this.settings,
      })
    },

    exportPNG() {
      downloadPng('briko-mosaic.png')
    },

    exportCSV() {
      if (!this.tilingResult) return
      downloadBomCsvWeek1(this.tilingResult.bom, 'briko-bom.csv')
    },
  }
})
