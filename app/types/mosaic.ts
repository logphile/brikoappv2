import { z } from 'zod'

export const ZBrickSize = z.tuple([z.number().int().positive(), z.number().int().positive()]) // [w,h]
export const ZPaletteColor = z.object({ id: z.number().int().optional(), name: z.string(), rgb: z.tuple([z.number(), z.number(), z.number()]) })
export const ZPalette = z.object({ name: z.string().optional(), colors: z.array(ZPaletteColor) })

export const ZSettings = z.object({
  maxWidth: z.number().int().min(16).max(512).default(256),
  maxHeight: z.number().int().min(16).max(512).default(256),
  brickSizes: z.array(ZBrickSize).default([[1,1],[1,2],[2,2],[2,4],[4,4],[4,8]]),
  distance: z.enum(['ciede2000','euclid']).default('ciede2000'),
  dither: z.enum(['none','floyd-steinberg']).default('none'),
})

// Use prefixed names to avoid clashing with existing declaration file exports
export type ZBrickSizeT = z.infer<typeof ZBrickSize>
export type ZPaletteColorT = z.infer<typeof ZPaletteColor>
export type ZPaletteT = z.infer<typeof ZPalette>
export type ZSettingsT = z.infer<typeof ZSettings>

// Export legacy declaration types for module consumers
import type { BomRow as BomRowD, WorkerIn as WorkerInD, WorkerOut as WorkerOutD, Placement as PlacementD, PaletteColor as PaletteColorD } from './mosaic.d'
export type { BomRowD as BomRow, WorkerInD as WorkerIn, WorkerOutD as WorkerOut, PlacementD as Placement, PaletteColorD as PaletteColor }

// Week-1 Mosaic Engine types (non-breaking additions)
// Stud size literal like "2x4"
export type StudSize = `${number}x${number}`

export interface MosaicSettings {
  width: number
  height: number
  allowedParts: StudSize[]
  snapOrientation: 'both' | 'horizontal' | 'vertical'
  seed?: number
}

export interface TiledBrick {
  x: number
  y: number
  w: number
  h: number
  colorId: number
}

// New BOM row shape for Week-1 exports
export interface BOMRow {
  part: StudSize
  colorId: number
  qty: number
  estUnitPrice: number
  estTotal: number
}

export interface TilingResult {
  bricks: TiledBrick[]
  bom: BOMRow[]
  estTotalCost: number
}
