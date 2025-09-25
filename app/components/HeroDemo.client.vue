<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps<{
  originalSrc?: string
  mosaicSrc?: string
  fixedHeight?: boolean
}>()

const originalUrl = ref(props.originalSrc || '/slider-original.jpg')
const mosaicUrl = ref(props.mosaicSrc || '/slider-mosaic.jpg')

function loadWithFallback(src: string, fallback: string, setter: (v: string) => void) {
  const img = new Image()
  img.onload = () => setter(src)
  img.onerror = () => setter(fallback)
  img.src = src
}

function refreshSources() {
  loadWithFallback(props.originalSrc || '/slider-original.jpg', '/og-default.png', (v) => (originalUrl.value = v))
  loadWithFallback(props.mosaicSrc || '/slider-mosaic.jpg', '/demo-mosaic.png', (v) => (mosaicUrl.value = v))
}

onMounted(refreshSources)
watch(() => [props.originalSrc, props.mosaicSrc], refreshSources)

// Purple theme runtime vars (belt-and-suspenders in addition to global CSS)
const sliderVars = computed(() => ({
  '--divider-color': '#2f3061',
  '--default-handle-width': '96px',
  '--default-handle-opacity': 0.9 as any
}))
</script>

<template>
  <div class="hero-demo briko-slider relative rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 h-full">
    <div class="rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] h-full">
      <!-- canvas -->
      <div :class="[
             fixedHeight ? 'relative h-full' : 'relative aspect-[3/4] sm:aspect-[4/3]',
             'bg-gradient-to-br from-neutral-100/60 to-neutral-800/40'
           ]">
        <img-comparison-slider
          class="compare-purple block w-full h-full"
          aria-label="Compare original and mosaic preview"
          :style="sliderVars as any"
        >
          <img slot="first" :src="originalUrl" alt="Original image" style="width:100%;height:100%;object-fit:cover;" />
          <img slot="second" :src="mosaicUrl" alt="Mosaic preview" style="width:100%;height:100%;object-fit:cover;" />
          <span slot="first-label" class="compare-label">Original</span>
          <span slot="second-label" class="compare-label">Mosaic preview</span>
        </img-comparison-slider>
      </div>
    </div>
  </div>
</template>
