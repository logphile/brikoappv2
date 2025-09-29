export type ColorKey = string // e.g. "#2F3061" or "194-Dark Bluish Gray"

export interface StepGrid {
  w: number
  h: number
  cells: Uint16Array // color index per cell, 0 if empty
}

export interface PaletteEntry { idx: number; key: ColorKey; hex: string; name: string }

export interface StepMetrics {
  step: number
  placedNow: number
  totalPlaced: number
  activeColors: Array<{ key: ColorKey; hex: string; count: number }>
}

export function diffStep(prev: StepGrid, curr: StepGrid, palette: PaletteEntry[]): StepMetrics {
  const used = new Map<number, number>()
  let placedNow = 0
  const len = curr.cells.length
  for (let i = 0; i < len; i++) {
    const a = prev.cells[i] | 0
    const b = curr.cells[i] | 0
    if (a === b) continue
    if (a === 0 && b !== 0) {
      placedNow++
      used.set(b, (used.get(b) || 0) + 1)
    }
  }
  const activeColors = [...used.entries()]
    .map(([idx, count]) => {
      const p = palette.find((p) => p.idx === idx)
      const hex = p?.hex || '#cccccc'
      const key = p?.key || String(idx)
      return { key, hex, count }
    })
    .sort((a, b) => b.count - a.count)

  const totalPlaced = countFilled(curr.cells)
  return { step: 0, placedNow, totalPlaced, activeColors }
}

export function countFilled(cells: Uint16Array): number {
  let n = 0
  for (let i = 0; i < cells.length; i++) if (cells[i] !== 0) n++
  return n
}
