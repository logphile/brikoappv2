export const PARTS_MAP = {
  plates: {
    '1x1': 'plate-1x1',
    '1x2': 'plate-1x2',
    '1x3': 'plate-1x3',
    '1x4': 'plate-1x4',
    '2x2': 'plate-2x2',
    '2x3': 'plate-2x3',
    '2x4': 'plate-2x4',
  },
  tiles: {
    '1x1': 'tile-1x1',
    '1x2': 'tile-1x2',
    '1x3': 'tile-1x3',
    '1x4': 'tile-1x4',
    '2x2': 'tile-2x2',
    '2x3': 'tile-2x3',
    '2x4': 'tile-2x4',
  }
} as const

export type TopSurface = keyof typeof PARTS_MAP // 'plates' | 'tiles'
