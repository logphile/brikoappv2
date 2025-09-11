// PDF export utility for Voxel Builder layered instructions
// Renders each layer via the provided THREE renderer/scene/camera and
// composes a multi-page PDF with a simple legend of color counts.

export async function exportLayersPdf(opts: {
  renderer: any,
  scene: any,
  camera: any,
  totalLayers: number,
  setLayer: (k: number) => void,
  colorCountsForLayer: (k: number) => Record<string, number>,
  filename?: string
}) {
  const { renderer, scene, camera, totalLayers, setLayer, colorCountsForLayer, filename = 'briko-3d-layers.pdf' } = opts
  // Lazy import jsPDF on client
  const { default: jsPDF } = await import('jspdf')

  // Landscape Letter (pts): 792 x 612
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' })

  // Target image box size (fits inside page with a right-side legend)
  const margin = 24
  const w = 720
  const h = 540

  const oldPixelRatio = renderer.getPixelRatio?.() ?? 1
  try {
    renderer.setPixelRatio?.(Math.min(2, (window as any).devicePixelRatio || 1))

    for (let k = 0; k < totalLayers; k++) {
      if (k > 0) pdf.addPage()
      setLayer(k)
      // Render now and capture as PNG
      renderer.render(scene, camera)
      const dataURL = renderer.domElement.toDataURL('image/png')

      // Header
      pdf.setFontSize(12)
      pdf.setTextColor('#111')
      pdf.text(`Layer ${k + 1} / ${totalLayers}`, margin, margin + 10)

      // Image
      pdf.addImage(dataURL, 'PNG', margin, margin + 16, w, h)

      // Legend on the right
      const counts = colorCountsForLayer(k)
      let y = margin + 16
      const x = margin + w + 16
      pdf.setFontSize(10)
      pdf.setTextColor('#111')
      pdf.text('Color counts (cumulative):', x, y)
      y += 14
      const entries = Object.entries(counts)
      // Sort by count desc
      entries.sort((a, b) => b[1] - a[1])
      for (const [hex, count] of entries) {
        // Color swatch
        try {
          pdf.setFillColor(hex as any)
        } catch (_) {
          // Fallback if hex parsing fails
          pdf.setFillColor('#999' as any)
        }
        pdf.rect(x, y - 8, 12, 12, 'F')
        pdf.setTextColor('#000')
        pdf.text(`${hex} — ${count}`, x + 18, y + 2)
        y += 16
        if (y > (612 - margin)) {
          // New column if overflow (simple wrap)
          y = margin + 30
        }
      }
    }
  } finally {
    renderer.setPixelRatio?.(oldPixelRatio)
  }

  pdf.save(filename)
}
