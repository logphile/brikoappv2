<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
useHead({
  title: 'How It Works | Briko',
  meta: [
    { name: 'description', content: 'Upload any image → Preview in bricks → Export build guide. Briko makes creating your own brick MOCs simple.' },
    { property: 'og:title', content: 'How It Works | Briko' },
    { property: 'og:description', content: 'Fast previews, smart tiling, and practical exports.' },
    { property: 'og:url', content: 'https://briko.app/how-it-works' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'How It Works | Briko' },
    { name: 'twitter:description', content: 'Upload any image → Preview in bricks → Export build guide. Briko makes creating your own brick MOCs simple.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/how-it-works' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const hiwWebPage = webPageJsonLd(
  siteUrl,
  '/how-it-works',
  'How It Works | Briko',
  'Upload any image → Preview in bricks → Export build guide. Briko makes creating your own brick MOCs simple.'
)
const hiwBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'How It Works', path: '/how-it-works' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(hiwWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(hiwBreadcrumbs) }
  ]
})
</script>

<template>
  <main class="px-6 py-16 max-w-6xl mx-auto">
    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">How Briko Works</h1>
    <p class="mt-3 text-lg opacity-80">
      Briko turns images into LEGO-style mosaics or 3D voxel builds. It’s optimized for speed and clarity so your preview feels instant and your parts list is accurate.
    </p>

    <!-- Steps -->
    <section class="mt-10 grid gap-4 md:grid-cols-4">
      <div class="rounded-2xl border border-white/10 p-5">
        <h2 class="font-semibold">1) Upload</h2>
        <p class="opacity-80 mt-1">Drag & drop or select a file. Briko preprocesses the image for clean edges.</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h2 class="font-semibold">2) Choose Mode & Palette</h2>
        <p class="opacity-80 mt-1">Mosaic or Voxel. Pick sizes, dimensions, and a brick color palette.</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h2 class="font-semibold">3) Generate</h2>
        <p class="opacity-80 mt-1">Greedy tiler / voxelizer optimizes for fewer plates and a clean look.</p>
      </div>
      <div class="rounded-2xl border border-white/10 p-5">
        <h2 class="font-semibold">4) Export</h2>
        <p class="opacity-80 mt-1">Download PNG, CSV parts list, or PDF build steps.</p>
      </div>
    </section>

    <!-- Tips -->
    <section class="mt-12 rounded-2xl border border-white/10 p-6">
      <h2 class="text-2xl font-bold">Tips</h2>
      <ul class="mt-3 space-y-2 opacity-90 list-disc pl-5">
        <li><strong>Image quality:</strong> Higher contrast images tile better.</li>
        <li><strong>Palette:</strong> Start with default; refine later for a specific look.</li>
        <li><strong>Performance:</strong> Targeting &lt;2s for 256×256 mosaics and 64³ voxels on modern hardware.</li>
      </ul>
    </section>

    <!-- CTA -->
    <div class="text-center mt-10">
      <NuxtLink to="/mosaic" class="px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow">Try Mosaic Builder</NuxtLink>
    </div>

    <p class="mt-10 text-xs opacity-60">Briko is an independent tool and is not affiliated with, endorsed by, or associated with the LEGO® Group.</p>
  </main>
</template>

<style scoped>
/* spacing for anchor jumps if we add IDs later */
h1, h2, h3{ scroll-margin-top: 96px; }
</style>
