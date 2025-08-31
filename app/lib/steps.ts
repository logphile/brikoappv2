import type { Placement, BomRow } from '@/types/mosaic'

export type Step = { index: number; items: Placement[] }

export function chunkSteps(placements: Placement[], maxPerStep = 300): Step[] {
  // Greedy: group by scanline to keep spatial proximity
  const sorted = [...placements].sort((a,b)=> a.y - b.y || a.x - b.x)
  const steps: Step[] = []
  for (let i=0, s=0; i<sorted.length; i+=maxPerStep, s++) {
    steps.push({ index: s+1, items: sorted.slice(i, i+maxPerStep) })
  }
  return steps
}

export function bomTotal(bom: BomRow[]) {
  return bom.reduce((sum, r) => sum + r.total_price, 0)
}
