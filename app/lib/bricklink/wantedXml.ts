import { BRICKLINK_PART_IDS } from './parts-map'
import { BRICKLINK_COLOR_IDS } from './colors-map'

export type WantedBomRow = { partKey: string; colorKey: string; qty: number }

function escapeXml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

export function generateBrickLinkWantedXML(
  bom: WantedBomRow[],
  opts?: { condition?: 'N' | 'U'; remarks?: string }
): string {
  const rows = new Map<string, { itemId: string; colorId: number; qty: number }>()
  for (const r of bom) {
    const itemId = BRICKLINK_PART_IDS[r.partKey]
    const colorId = BRICKLINK_COLOR_IDS[r.colorKey]
    if (!itemId || colorId == null) {
      throw new Error(`Missing BrickLink mapping for: ${!itemId ? r.partKey : r.colorKey}`)
    }
    const key = `${itemId}|${colorId}`
    const cur = rows.get(key)
    if (cur) cur.qty += r.qty
    else rows.set(key, { itemId, colorId, qty: r.qty })
  }

  const items = [...rows.values()].map(({ itemId, colorId, qty }) => {
    const cond = opts?.condition ?? 'N'
    const remarks = opts?.remarks ? `\n<REMARKS>${escapeXml(opts.remarks)}</REMARKS>` : ''
    return (
`<ITEM>
<ITEMTYPE>P</ITEMTYPE>
<ITEMID>${itemId}</ITEMID>
<COLOR>${colorId}</COLOR>
<MINQTY>${qty}</MINQTY>
<CONDITION>${cond}</CONDITION>${remarks}
</ITEM>`
    )
  })

  return `<INVENTORY>\n${items.join('\n')}\n</INVENTORY>`
}

export function downloadWantedXml(xml: string, filename = `briko-wanted-list-${Date.now()}.xml`) {
  const blob = new Blob([xml], { type: 'text/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
