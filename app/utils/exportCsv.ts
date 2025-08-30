export function exportCsv(bom: Array<{ part_num: string; color: string; count: number }>) {
  const header = 'part_num,color,count'
  const rows = bom.map(b => `${b.part_num},${b.color},${b.count}`)
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'brickmoc_bom.csv'; a.click()
  URL.revokeObjectURL(url)
}
