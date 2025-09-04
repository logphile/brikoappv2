<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const siteUrl = 'https://briko.app'

useHead({
  title: 'Turn Any Idea Into a Brick Build',
  meta: [
    { name: 'description', content: 'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.' },
    { property: 'og:title', content: 'Briko | Turn Any Idea Into a Brick Build' },
    { property: 'og:description', content: 'Image → Mosaic/Voxel → BOM + price → PDF/CSV/PNG.' },
    { property: 'og:url', content: 'https://briko.app/' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Briko | Turn Any Idea Into a Brick Build' },
    { name: 'twitter:description', content: 'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/' }
  ]
})

// Fallback demo image handler
const onDemoImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = '/og-default.png'
}

// Image path as a simple string (served from /public). Using a const avoids Vite asset import rewriting.
const demoImg = '/demo-mosaic.png'

// JSON-LD: WebPage + Breadcrumbs
const homeWebPage = webPageJsonLd(
  siteUrl,
  '/',
  'Turn Any Idea Into a Brick Build',
  'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.'
)
const homeBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(homeWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(homeBreadcrumbs) }
  ]
})
</script>

<template>
  <main class="px-6 py-16 max-w-6xl mx-auto">
    <!-- Hero -->
    <section class="text-center">
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">Turn any idea into a brick build</h1>
      <p class="mt-4 text-lg md:text-xl opacity-80">
        Upload an image → get a LEGO-style mosaic or 3D voxel preview → export parts & cost in seconds.
      </p>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <NuxtLink to="/mosaic" class="btn-primary">Try Mosaic Builder</NuxtLink>
        <NuxtLink to="/how-it-works" class="px-5 py-3 rounded-2xl border border-white/20">See How It Works</NuxtLink>
      </div>
      <div class="mt-4 text-sm opacity-70">Free to try · No signup required · Not affiliated with LEGO® Group</div>
    </section>

    <!-- Quick Demo -->
    <section class="mt-14 grid md:grid-cols-2 gap-8 items-center">
      <img :src="demoImg" @error="onDemoImgError" alt="Mosaic preview demo" class="rounded-2xl shadow" />
      <ul class="space-y-3 text-base md:text-lg">
        <li>• Instant LEGO-style color mapping</li>
        <li>• Greedy tiling → fewer plates, cleaner look</li>
        <li>• Bill of Materials + cost estimate</li>
        <li>• PNG / CSV / PDF exports</li>
      </ul>
    </section>

    <!-- Feature Grid -->
    <section class="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">Mosaic Engine</h3>
        <p class="opacity-80 mt-1">Photo → brick palette → greedy tiling</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">3D Voxel Preview</h3>
        <p class="opacity-80 mt-1">Rotate, zoom, and step through layers</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">Smart BOM</h3>
        <p class="opacity-80 mt-1">Accurate parts list with size breakdown</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">Fast Exports</h3>
        <p class="opacity-80 mt-1">PNG, CSV, PDF build steps</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">Save & Share</h3>
        <p class="opacity-80 mt-1">Supabase projects (coming soon)</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h3 class="font-semibold text-lg">Performance</h3>
        <p class="opacity-80 mt-1">256×256 in &lt;2s • 64³ voxels in &lt;2s</p>
      </div>
    </section>

    <!-- How It Works teaser -->
    <section class="mt-16 rounded-2xl border border-white/10 p-6 md:p-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold">How it works</h2>
      <p class="mt-2 opacity-80">1) Upload  2) Pick size & palette  3) Generate  4) Export</p>
      <NuxtLink to="/how-it-works" class="inline-block mt-5 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15">See Full Guide</NuxtLink>
    </section>

    <p class="mt-8 text-xs opacity-60">Briko is an independent tool and is not affiliated with, endorsed by, or associated with the LEGO® Group.</p>
  </main>
</template>

<style scoped>
.btn-primary{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white shadow; }
.btn-secondary{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white; }
.btn-ghost{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-transparent hover:bg-white/5 ring-1 ring-white/10; }
.card{ @apply rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10; }
</style>
