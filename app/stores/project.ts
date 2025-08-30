import { defineStore } from 'pinia'
export const useProjectStore = defineStore('project', {
  state: () => ({
    mode: 'mosaic' as 'mosaic' | 'voxel',
    settings: { size: 256, dithering: true },
    bom: [] as Array<{ part_num: string; color: string; count: number }>,
    estPrice: 0,
    thumbUrl: ''
  }),
  actions: { setBOM(bom: Array<{ part_num: string; color: string; count: number }>, est: number) { this.bom = bom; this.estPrice = est } }
})
