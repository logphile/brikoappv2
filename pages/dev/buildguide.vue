<script setup lang="ts">
import { ref } from 'vue'
import { renderBuildGuideV2 } from '@/lib/buildGuideV2'
import type { BuildGuideCtx, StepCell } from '@/lib/buildGuideV2/types'

const busy = ref(false)

function savePdf(pdf: any, filename: string) {
  pdf.save(filename)
}

async function generateSample() {
  busy.value = true
  try {
    // sample image from /public (use any existing asset)
    const imgUrl = '/demo-original.jpg'
    const imgRes = await fetch(imgUrl)
    const blob = await imgRes.blob()
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.readAsDataURL(blob)
    })

    const cols = 48, rows = 32
    const palette = [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#111827' },
      { name: 'Sand Green', hex: '#A0BFA0' },
      { name: 'Dark Bluish Gray', hex: '#6B7280' },
      { name: 'Bright Light Blue', hex: '#60A5FA' },
    ]
    const nameFromHex = (hex:string) => palette.find(p => p.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex

    const all: StepCell[] = []
    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const color = palette[(c + r) % palette.length].hex
        all.push({ col: c, row: r, colorHex: color })
      }
    }
    const steps: StepCell[][] = []
    const chunk = 200
    for (let i=0; i<all.length; i+=chunk) steps.push(all.slice(i, i+chunk))

    const ctx: BuildGuideCtx = {
      cols, rows,
      widthIn: cols * 0.315, heightIn: rows * 0.315,
      widthCm: cols * 0.8, heightCm: rows * 0.8,
      totalBricks: all.length,
      distinctColors: palette.length,
      estimateUSD: 39.95,
      palette,
      originalImg: dataUrl, originalType: 'JPEG',
      originalImgW: 1600, originalImgH: 1066,
      steps,
      nameFromHex,
      bom: [
        { partLabel: 'Plate 1×1', colorName: 'White', qty: 220, estimate: 3.3 },
        { partLabel: 'Plate 1×2', colorName: 'Sand Green', qty: 140, estimate: 4.2 },
        { partLabel: 'Plate 2×2', colorName: 'Dark Bluish Gray', qty: 90, estimate: 5.7 },
      ],
      pageFormat: 'letter'
    }

    const pdf = await renderBuildGuideV2(ctx)
    savePdf(pdf, 'briko-build-guide-sample.pdf')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Build Guide V2 — Demo</h1>
    <p class="text-sm text-zinc-400 mb-4">Generates a sample PDF using the v2 renderer.</p>
    <button
      class="px-4 py-2 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-white"
      :disabled="busy"
      @click="generateSample"
    >
      {{ busy ? 'Generating…' : 'Generate Sample Build Guide' }}
    </button>
    <p class="text-xs text-zinc-500 mt-3">
      Make sure <code>/public/pdf-templates/cover-v2.png</code> and Outfit TTFs exist.
    </p>
  </div>
</template>
