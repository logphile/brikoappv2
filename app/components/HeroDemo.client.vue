<script setup lang="ts">
import { ref } from 'vue'

const pos = ref(60) // slider position (percent)
let drag = false
const clamp = (n: number) => Math.max(0, Math.min(100, n))
function onDrag(e: PointerEvent) {
  if (e.type === 'pointerdown') {
    drag = true
    ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }
  if (!drag) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  pos.value = clamp(((e.clientX - rect.left) / rect.width) * 100)
}
const originalOk = ref(true)
const mosaicOk = ref(true)
defineProps<{
  originalSrc?: string
  mosaicSrc?: string
}>()
</script>

<template>
  <div class="hero-demo relative rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
    <div class="rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <!-- canvas -->
      <div class="relative aspect-[3/4] sm:aspect-[4/3] bg-gradient-to-br from-neutral-100/60 to-neutral-800/40">
        <!-- base: original -->
        <img v-show="originalOk" :src="originalSrc || '/demo/original.jpg'" @error="originalOk=false"
             alt="Original photo"
             class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none" />

        <!-- overlay: mosaic, clipped by slider -->
        <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
          <img v-show="mosaicOk" :src="mosaicSrc || '/demo/mosaic.jpg'" @error="mosaicOk=false"
               alt="Mosaic preview"
               class="h-full w-full object-cover select-none pointer-events-none" />
          <!-- studs texture overlay -->
          <div class="absolute inset-0 opacity-[.18] mix-blend-overlay"
               style="background:url('/patterns/studs.svg') 0 0/24px 24px"></div>
        </div>

        <!-- labels -->
        <div class="absolute left-3 top-3 text-[11px] px-2 py-0.5 rounded-full bg-black/55 text-white/90 backdrop-blur-sm">
          Original
        </div>
        <div class="absolute right-3 top-3 text-[11px] px-2 py-0.5 rounded-full bg-black/55 text-white/90 backdrop-blur-sm">
          Mosaic preview
        </div>

        <!-- drag overlay: divider + handle -->
        <div class="absolute inset-0 z-10" style="touch-action:none"
             @pointerdown="onDrag" @pointermove="onDrag" @pointerup="drag=false" @pointerleave="drag=false">
          <!-- divider -->
          <div class="absolute inset-y-4 w-[2px] rounded bg-white/80 shadow-[0_0_0_1px_rgba(255,255,255,.2)]"
               :style="{ left: `calc(${pos}% - 1px)` }"></div>

          <!-- handle -->
          <div class="handle absolute bottom-10 sm:bottom-8 -translate-x-1/2 grid place-items-center"
               :style="{ left: `${pos}%` }" aria-hidden="true"
               role="slider" aria-label="Compare slider" aria-valuemin="0" aria-valuemax="100"
               :aria-valuenow="Math.round(pos)">
            <div class="h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-white shadow-[0_4px_16px_rgba(255,90,31,.35)]
                        ring-2 ring-white/70 outline-none"></div>
          </div>
        </div>

        <!-- slider control -->
        <input type="range" min="0" max="100" v-model="pos" aria-label="Compare slider"
               class="absolute bottom-10 sm:bottom-4 left-1/2 -translate-x-1/2 w-[70%]
                      [--c:#FF5A1F] appearance-none h-2 rounded-full bg-white/20
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[var(--c)]
                      [&::-webkit-slider-thumb]:border
                      [&::-webkit-slider-thumb]:border-white/70
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/70
                      [&::-moz-range-thumb]:bg-[var(--c)]" />
      </div>
    </div>
  </div>
</template>
