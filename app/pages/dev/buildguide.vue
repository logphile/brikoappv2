<script setup lang="ts">
import { ref } from 'vue'
import { renderBuildGuideV2 } from '@/lib/buildGuideV2'
import type { BuildGuideCtx, StepCell } from '@/lib/buildGuideV2/types'
import { useToasts } from '@/composables/useToasts'

const busy = ref(false)
const { show, dismiss } = useToasts()

async function onGenerateBuildGuide(ctx: BuildGuideCtx) {
  // 1) UI state + persistent toast
  const toastId = show('Generating build guide…', 'info', 0)
  try {
    // 2) Await the async generator (DON’T forget await)
    const pdf = await renderBuildGuideV2(ctx)

    // 3) Save the PDF in a way browsers won’t block
    try {
      pdf.save(`briko-build-guide-${Date.now()}.pdf`)
    } catch {
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `briko-build-guide-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }

    show('Build guide ready.', 'success', 2500)
  } catch (err: any) {
    // 4) Reveal the actual cause
    console.error('[BuildGuide] generation failed:', err)
    const msg = (err?.message ?? err?.toString?.() ?? 'Unknown error').toString().slice(0, 180)
    show(`Failed to generate PDF: ${msg}`, 'error', 6000)
  } finally {
    // 5) Always close the “loading” toast last
    dismiss(toastId)
  }
}

async function generateSample() {
  busy.value = true
  try {
    // sample image from /public
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

    await onGenerateBuildGuide(ctx)
  } finally {
    busy.value = false
  }
}

async function debugBuildGuideSelfTest() {
  try {
    const ctx: BuildGuideCtx = {
      cols: 16, rows: 16,
      widthIn: 5.0, heightIn: 5.0,
      widthCm: 12.7, heightCm: 12.7,
      totalBricks: 256, distinctColors: 4,
      estimateUSD: 9.99,
      palette: [
        { name:'Black', hex:'#111827' },
        { name:'White', hex:'#FFFFFF' },
        { name:'Red', hex:'#EF4444' },
        { name:'Blue', hex:'#3B82F6' }
      ],
      originalImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12P4//8/AwAI/AL+qC7f9QAAAABJRU5ErkJggg==',
      originalType: 'PNG', originalImgW: 1, originalImgH: 1,
      steps: [
        Array.from({length:32}).map((_,i) => ({ col: i%16, row: Math.floor(i/16), colorHex: i%2? '#EF4444':'#3B82F6' })),
        Array.from({length:32}).map((_,i) => ({ col: (i%16), row: (i%16), colorHex: i%2? '#111827':'#FFFFFF' })),
      ],
      nameFromHex: (h) => h,
      bom: [{ partLabel:'Plate 1×1', colorName:'Black', qty:64 }],
      pageFormat: 'letter'
    }
    const pdf = await renderBuildGuideV2(ctx)
    console.log('[BuildGuide] pages:', (pdf as any).getNumberOfPages?.())
    try { pdf.save('self-test.pdf') } catch {}
    show('Self-test PDF downloaded.', 'success', 2500)
  } catch (e: any) {
    console.error('[BuildGuide] self-test error:', e)
    show(`Self-test failed: ${e?.message ?? e}`, 'error', 6000)
  }
}
</script>

<template>
  <div class="p-6 text-white">
    <h1 class="text-2xl font-semibold mb-4">Build Guide V2 — Demo</h1>
    <p class="text-sm opacity-70 mb-4">Generates a sample PDF using the v2 renderer.</p>
    <button
      class="px-4 py-2 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-white"
      :disabled="busy"
      @click="generateSample"
    >
      {{ busy ? 'Generating…' : 'Generate Sample Build Guide' }}
    </button>
    <button
      class="ml-3 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm"
      :disabled="busy"
      @click="debugBuildGuideSelfTest"
    >
      Self-test (dev)
    </button>
    <p class="text-xs opacity-60 mt-3">
      Make sure <code>/public/pdf-templates/cover-v2.png</code> exists and Outfit TTFs are present in <code>app/assets/fonts</code>.
    </p>
  </div>
</template>
