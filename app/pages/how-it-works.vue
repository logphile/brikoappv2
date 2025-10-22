<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
useHead({
  title: 'How It Works',
  meta: [
    { name: 'description', content: 'Upload any image → Preview in bricks → Export build guide. Briko makes creating your own brick MOCs simple.' },
    { name: 'keywords', content: 'how it works, LEGO mosaic generator, photo to LEGO, voxel builder, Briko app, build guide' },
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
  'How It Works',
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

// FAQ items
const faq = [
  { q: 'What image types are supported?', a: 'PNG, JPG, or WebP up to 25 MB.' },
  { q: 'How accurate is the parts list?', a: 'It reflects the chosen palette and tiling; integrate BrickLink/Rebrickable later for live pricing.' },
  { q: 'Can I share my build?', a: 'Yes—save to your Studio and choose “Make Public”.' },
]
</script>

<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero -->
      <header class="mb-8">
        <h1 class="text-3xl md:text-5xl font-extrabold leading-tight">How Briko Works</h1>
        <p class="mt-3 text-lg text-[color:var(--text-dim)]">
          Turn any image into a LEGO-style mosaic or 3D voxel build—fast previews, clean parts lists, and easy exports.
        </p>
      </header>

      <!-- Quick nav -->
      <nav class="mb-6 flex flex-wrap gap-2">
        <a href="#steps" class="btn-purple-outline focus-cyber h-9 px-3 text-sm">Steps</a>
        <a href="#tips" class="btn-purple-outline focus-cyber h-9 px-3 text-sm">Tips</a>
        <a href="#faq" class="btn-purple-outline focus-cyber h-9 px-3 text-sm">FAQ</a>
      </nav>

      <!-- Steps -->
      <section id="steps" class="card-ivory p-5 sm:p-6 mb-8">
        <h2 class="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
          The 4-Step Flow
          <span class="h-[3px] w-10 rounded-full" style="background:#2F3061"></span>
        </h2>

        <div class="grid auto-rows-fr gap-4 md:grid-cols-2">
          <StepCard num="1" title="Upload">
            Drag & drop an image or pick a file. Briko preprocesses it for crisp edges.
          </StepCard>

          <StepCard num="2" title="Choose Mode & Palette">
            Mosaic or Voxel. Pick sizes, dimensions, and a brick color palette.
          </StepCard>

          <StepCard num="3" title="Generate">
            Greedy tiler / voxelizer minimizes plates for a cleaner look.
          </StepCard>

          <StepCard num="4" title="Export">
            Download PNG, CSV parts list, or PDF build steps.
          </StepCard>
        </div>

        <div class="mt-6">
          <NuxtLink to="/mosaic" class="btn-pink focus-cyber">Photo to Bricks</NuxtLink>
        </div>
      </section>

      <!-- Tips -->
      <section id="tips" class="card-ivory p-5 sm:p-6 mb-8">
        <h2 class="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
          Tips
          <span class="h-[3px] w-10 rounded-full" style="background:#2F3061"></span>
        </h2>
        <ul class="space-y-3">
          <li class="flex gap-3">
            <span class="h-6 w-6 rounded-full flex items-center justify-center text-[var(--ivory)]" style="background:#2F3061">•</span>
            <div><strong>Image quality:</strong> Higher contrast images tile better.</div>
          </li>
          <li class="flex gap-3">
            <span class="h-6 w-6 rounded-full flex items-center justify-center text-[var(--ivory)]" style="background:#2F3061">•</span>
            <div><strong>Palette:</strong> Start with default; refine later for a specific look.</div>
          </li>
          <li class="flex gap-3">
            <span class="h-6 w-6 rounded-full flex items-center justify-center text-[var(--ivory)]" style="background:#2F3061">•</span>
            <div><strong>Performance:</strong> Targeting &lt;2s for 256×256 mosaics and 64³ voxels on modern hardware.</div>
          </li>
        </ul>
      </section>

      <!-- FAQ (accordion) -->
      <section id="faq" class="card-ivory p-5 sm:p-6">
        <h2 class="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
          FAQ
          <span class="h-[3px] w-10 rounded-full" style="background:#2F3061"></span>
        </h2>

        <FAQ :items="faq" />
      </section>
    </div>
  </main>
</template>

<style scoped>
/* spacing for anchor jumps if we add IDs later */
h1, h2, h3{ scroll-margin-top: 96px; }
</style>
