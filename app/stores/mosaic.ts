import { defineStore } from 'pinia'
import { useNuxtApp } from 'nuxt/app'
import { useToasts } from '@/composables/useToasts'
import type { MosaicSettings, TiledBrick, TilingResult, StudSize } from '@/types/mosaic'
import { MosaicSettingsSchema } from '@/schemas/mosaic'
import { buildBOMWithBuckets } from '@/lib/bom'
import priceTable from '@/data/brick_prices.json'
import { downloadBomCsvWeek1, downloadPng } from '@/lib/exporters'
import { legoPalette } from '@/lib/palette/lego'
import { createWorkerTask } from '@/utils/worker-task'

export type Status = 'idle' | 'quantized' | 'tiling' | 'tiled' | 'error'

// Abortable greedy tiler task shared across runs
const tilingTask = createWorkerTask<any>(() => import('@/workers/greedyTiler?worker').then((m: any) => new m.default()))

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

      try {
        const msg: any = await tilingTask.run(
          { grid: this.grid, width: this.width, height: this.height, settings: this.settings },
          {
            onProgress: (data: any) => {
              if (data && data.type === 'progress') {
                this.overlayBricks.push(...(data.bricksPartial as TiledBrick[]))
                this.coveragePct = data.coveragePct
              }
            },
            resolveWhen: (d: any) => d && d.type === 'done'
          }
        )
        const bricks = msg.bricks as TiledBrick[]
        const { rows, total } = buildBOMWithBuckets(bricks, priceTable as any, legoPalette as any)
        this.tilingResult = { bricks, bom: rows, estTotalCost: total }
        this.status = 'tiled'
        // trigger a debounced save when tiling finishes
        this.saveProjectDebounced()
        try { useToasts().show('Tiling complete — estimate updated', 'success') } catch {}
      } catch (e: any) {
        if (e && e.name === 'AbortError') {
          // silently ignore aborted runs
          return
        }
        console.error(e)
        this.status = 'error'
      }
    },

    cancelTiling() {
      try { tilingTask.cancel() } catch {}
      if (this.status === 'tiling') this.status = this.grid ? 'quantized' as Status : 'idle'
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
      if (!$supabase) { try { useToasts().show('Auth unavailable — cannot save', 'error') } catch {} ; return }
      if (!this.grid || !this.width || !this.height) return
      try {
        // Save mosaic grid (JSON array of numbers)
        const { error: mErr } = await $supabase.from('mosaics').insert({
          project_id: this.currentProjectId,
          grid: Array.from(this.grid),
          palette_version: 'mvp'
        })
        if (mErr) throw mErr
        try { useToasts().show('Mosaic saved', 'success') } catch {}
        // Save tiling if present
        if (this.tilingResult) {
          const { error: tErr } = await $supabase.from('tilings').insert({
            project_id: this.currentProjectId,
            bricks: this.tilingResult.bricks,
            bom: this.tilingResult.bom,
            est_total: this.tilingResult.estTotalCost
          })
          if (tErr) throw tErr
          try { useToasts().show('Tiling saved', 'success') } catch {}
        }
      } catch (e: any) {
        console.error(e)
        try { useToasts().show('Failed to save project', 'error') } catch {}
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
      if (!$supabase) { try { useToasts().show('Auth unavailable — cannot upload', 'error') } catch {} ; return }
      const cvs: HTMLCanvasElement | undefined = (window as any).__brikoCanvas
      if (!cvs) return
      const blob: Blob | null = await new Promise((resolve) => cvs.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      const storage_path = `previews/${this.currentProjectId}.png`
      const { error: upErr } = await $supabase.storage.from('public').upload(storage_path, blob, { upsert: true, contentType: 'image/png' })
      if (upErr) { console.error(upErr); try { useToasts().show('Upload failed', 'error') } catch {} ; return }
      const { error: insErr } = await $supabase.from('assets').insert({ project_id: this.currentProjectId, kind: 'preview_png', storage_path })
      if (insErr) { console.error(insErr); try { useToasts().show('Upload recorded with warnings', 'error') } catch {} ; return }
      try { useToasts().show('Preview uploaded', 'success') } catch {}
    }
  }
})
