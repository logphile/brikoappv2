<script setup lang="ts">
type Item = {
  title: string
  blurb: string
  icon: string // path to vendored SVG in /public/icons/
}

const items: Item[] = [
  { title: 'Upload a photo',         blurb: 'Any image. We’ll map to brick colors.', icon: '/icons/upload.svg' },
  { title: 'Pick size & palette',    blurb: 'Studs, plates, LEGO-ish palettes.',     icon: '/icons/palette.svg' },
  { title: 'Generate preview',       blurb: 'Greedy tiler + instant mosaic.',        icon: '/icons/preview.svg' },
  { title: 'Export PNG · CSV · PDF', blurb: 'Parts list, cost, build guide.',        icon: '/icons/export.svg' },
]
</script>

<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
    data-testid="feature-grid"
  >
    <div
      v-for="(it, i) in items"
      :key="i"
      class="group relative overflow-hidden rounded-2xl ring-transparent
             bg-[#343434]/60 border border-[#343434]/25 p-4 lg:p-5 shadow-sm transition
             hover:shadow-lg hover:border-[#00E5A0]/40 hover:ring-1 hover:ring-[#00E5A0]/25"
    >
      <!-- icon -->
      <div class="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 border border-white/10 grid place-content-center mb-3">
        <img :src="it.icon" alt="" class="h-5 w-5 md:h-6 md:w-6 opacity-90" />
      </div>

      <!-- text -->
      <h3 class="font-slab text-base md:text-lg leading-tight" style="color:#2F3061">
        {{ it.title }}
      </h3>
      <p class="text-white/70 text-sm mt-1">
        {{ it.blurb }}
      </p>

      <!-- micro glow on hover -->
      <div
        class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
        style="box-shadow: 0 0 0 1px rgba(0,229,160,.25) inset, 0 10px 30px rgba(0,229,160,.08)"
      />
    </div>
  </div>
</template>
