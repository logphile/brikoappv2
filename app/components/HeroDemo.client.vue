<script setup lang="ts">
import { ref } from 'vue'

const pos = ref(60) // slider position (percent)
defineProps<{
  originalSrc?: string
  mosaicSrc?: string
}>()
</script>

<template>
  <div class="relative rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
    <div class="rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <!-- canvas -->
      <div class="relative aspect-[4/3] bg-gradient-to-br from-neutral-100/60 to-neutral-800/40">
        <!-- base: original -->
        <img :src="originalSrc || '/demo/original.jpg'"
             alt="Original"
             class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none" />

        <!-- overlay: mosaic, clipped by slider -->
        <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
          <img :src="mosaicSrc || '/demo/mosaic.jpg'"
               alt="Mosaic"
               class="h-full w-full object-cover select-none pointer-events-none" />
        </div>

        <!-- handle line -->
        <div class="absolute top-0 bottom-0 -right-0.5 w-[3px] bg-white/70 rounded"
             :style="{ left: `calc(${pos}% - 1.5px)` }"></div>

        <!-- labels -->
        <div class="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full bg-black/50 text-white/80">
          Original
        </div>
        <div class="absolute right-3 top-3 text-[11px] px-2 py-1 rounded-full bg-black/50 text-white/80">
          Mosaic preview
        </div>

        <!-- slider control -->
        <input type="range" min="0" max="100" v-model="pos"
               class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%]
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
