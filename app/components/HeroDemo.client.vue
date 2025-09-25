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

// Graceful fallback: use manual slider until the web component is defined
const useWC = ref(false)
const pos = ref(60)
function onPointer(e: PointerEvent){
  const type = e.type
  const el = e.currentTarget as HTMLElement
  if (!el) return
  if (type === 'pointerdown') { try { el.setPointerCapture?.(e.pointerId) } catch {}
  }
  const rect = el.getBoundingClientRect()
  const next = ((e.clientX - rect.left) / rect.width) * 100
  pos.value = Math.max(0, Math.min(100, next))
}

onMounted(() => {
  try {
    if (customElements?.get && customElements.get('img-comparison-slider')) { useWC.value = true; return }
    // If it gets registered later (CDN/plugin), upgrade to WC automatically
    customElements?.whenDefined?.('img-comparison-slider')?.then(() => { useWC.value = true })
  } catch {}
})
</script>

<template>
  <div class="hero-demo briko-slider relative rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 h-full">
    <div class="rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] h-full">
      <!-- canvas -->
      <div :class="[
             fixedHeight ? 'relative h-full' : 'relative aspect-[3/4] sm:aspect-[4/3]',
             'bg-gradient-to-br from-neutral-100/60 to-neutral-800/40'
           ]">
        <template v-if="useWC">
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
        </template>
        <template v-else>
          <!-- Fallback manual slider with purple divider and big handle -->
          <!-- base: mosaic -->
          <img :src="mosaicUrl"
               alt="Mosaic preview"
               class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none" />

          <!-- overlay: original, clipped by slider -->
          <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
            <img :src="originalUrl" alt="Original image" class="h-full w-full object-cover select-none pointer-events-none" />
          </div>

          <!-- Labels -->
          <div class="absolute left-3 top-3 text-[11px] px-2 py-0.5 rounded-full bg-black/55 text-white/90 backdrop-blur-sm">Original</div>
          <div class="absolute right-3 top-3 text-[11px] px-2 py-0.5 rounded-full bg-black/55 text-white/90 backdrop-blur-sm">Mosaic preview</div>

          <!-- Interaction layer: purple divider + big handle -->
          <div class="absolute inset-0 z-10 group" style="touch-action:none"
               @pointerdown="onPointer" @pointermove="onPointer">
            <!-- divider (purple) -->
            <div class="absolute inset-y-4 w-[2px] rounded" :style="{ left: `calc(${pos}% - 1px)`, background: '#2f3061' }"></div>

            <!-- handle (96px, purple, hide on keyboard focus) -->
            <div class="absolute bottom-10 sm:bottom-8 -translate-x-1/2 grid place-items-center"
                 :style="{ left: `${pos}%` }" aria-hidden="true">
              <div tabindex="0" class="h-24 w-24 rounded-full border border-[#2f3061]"
                   style="background: rgba(47,48,97,0.12); box-shadow: 0 12px 32px -12px rgba(0,0,0,.55);"
              ></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
