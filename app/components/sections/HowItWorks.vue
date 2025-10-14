<script setup lang="ts">
const steps = [
  { icon: 'upload',      label: 'Upload',       sub: 'Pick any photo' },
  { icon: 'palette',     label: 'Pick palette', sub: 'LEGO-style colors' },
  { icon: 'play_circle', label: 'Preview',      sub: 'Instant mosaic' },
  { icon: 'ios_share',   label: 'Export',       sub: 'PNG · CSV · PDF' },
]
</script>

<template>
  <section class="py-10" style="background-color:#FFD808">
    <div class="mx-auto max-w-5xl px-4 sm:px-6">
      <header class="text-center mb-6">
        <h2 class="text-3xl font-semibold" style="color:#111827">How it works</h2>
        <p class="text-sm mt-1 text-black/70">Four quick steps from photo to bricks.</p>
        <div class="mx-auto mt-2 h-1 w-16 rounded-full" style="background:#FF0062"></div>
      </header>

      <!-- Flow -->
      <div class="howflow grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <div v-for="(s, i) in steps" :key="i" class="howflow-step">
          <div class="howflow-icon">
            <span class="material-symbols-rounded text-xl">{{ s.icon }}</span>
          </div>
          <div class="howflow-dot" aria-hidden="true"></div>
          <div class="howflow-label">{{ s.label }}</div>
          <div class="howflow-sub">{{ s.sub }}</div>
        </div>
      </div>

      <!-- Unified CTA row -->
      <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
        <NuxtLink to="/mosaic" class="btn btn-primary">Try Photo to Bricks →</NuxtLink>
        <NuxtLink to="/guide"  class="btn btn-secondary">See full guide →</NuxtLink>
      </div>
    </div>
  </section>
</template>
