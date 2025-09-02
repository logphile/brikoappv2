import { defineStore } from 'pinia'
import { useNuxtApp } from 'nuxt/app'
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

    // persistence
    currentProjectId: null as string | null,
    _saveTimer: null as any,
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
      this.saveProjectDebounced()
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
          // trigger a debounced save when tiling finishes
          this.saveProjectDebounced()
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

    setCurrentProject(id: string | null) { this.currentProjectId = id },

    async saveProject() {
      if (!this.currentProjectId) return
      const { $supabase } = useNuxtApp() as any
      if (!$supabase) return
      if (!this.grid || !this.width || !this.height) return
      // Save mosaic grid (JSON array of numbers)
      await $supabase.from('mosaics').insert({
        project_id: this.currentProjectId,
        grid: Array.from(this.grid),
        palette_version: 'mvp'
      })
      // Save tiling if present
      if (this.tilingResult) {
        await $supabase.from('tilings').insert({
          project_id: this.currentProjectId,
          bricks: this.tilingResult.bricks,
          bom: this.tilingResult.bom,
          est_total: this.tilingResult.estTotalCost
        })
      }
    },

    saveProjectDebounced(ms = 800) {
      if (this._saveTimer) clearTimeout(this._saveTimer)
      this._saveTimer = setTimeout(() => { this.saveProject() }, ms)
    },

    async loadProject(id: string) {
      const { $supabase } = useNuxtApp() as any
      if (!$supabase) return null
      this.currentProjectId = id
      // latest mosaic
      const { data: m } = await $supabase.from('mosaics').select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (m && Array.isArray(m.grid)) {
        const idx = new Uint16Array(m.grid as number[])
        this.setGrid(idx, this.settings.width, this.settings.height)
      }
      const { data: t } = await $supabase.from('tilings').select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (t && t.bom && t.bricks) {
        const est = typeof t.est_total === 'number' ? t.est_total : 0
        this.tilingResult = { bricks: t.bricks, bom: t.bom, estTotalCost: est }
        this.status = 'tiled'
      }
      return { mosaic: m, tiling: t }
    },

    async uploadPreview() {
      if (!this.currentProjectId) return
      const { $supabase } = useNuxtApp() as any
      if (!$supabase) return
      const cvs: HTMLCanvasElement | undefined = (window as any).__brikoCanvas
      if (!cvs) return
      const blob: Blob | null = await new Promise((resolve) => cvs.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      const storage_path = `previews/${this.currentProjectId}.png`
      const { error: upErr } = await $supabase.storage.from('public').upload(storage_path, blob, { upsert: true, contentType: 'image/png' })
      if (upErr) { console.error(upErr); return }
      await $supabase.from('assets').insert({ project_id: this.currentProjectId, kind: 'preview_png', storage_path })
    }
  }
})
