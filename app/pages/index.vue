<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { ref } from 'vue'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import FeaturePoints from '@/components/home/FeaturePoints.vue'
import HowItWorks from '@/components/sections/HowItWorks.vue'
import IconUpload from '@/components/icons/IconUpload.vue'
import IconTune from '@/components/icons/IconTune.vue'
import IconAuto from '@/components/icons/IconAuto.vue'
import { subscribeEmail } from '@/composables/useSubscribers'

const siteUrl = 'https://briko.app'

const buildTag = new Date().toISOString()

useHead({
  title: 'Turn Any Idea Into a Brick Build',
  meta: [
    { name: 'description', content: 'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.' },
    { name: 'keywords', content: 'LEGO mosaic generator, photo to LEGO, pixel art builder, LEGO MOC, Briko app, voxel builder' },
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
    { rel: 'canonical', href: 'https://briko.app/' },
    // Preload LCP image for faster discovery (absolute public URLs)
    { rel: 'preload', as: 'image', href: '/home-1-mosaic.png' },
    { rel: 'preload', as: 'image', href: '/home-1-original.jpg' },
    { rel: 'preload', as: 'image', href: '/home-2-mosaic.png' },
    { rel: 'preload', as: 'image', href: '/home-2-original.jpg' }
  ]
})

const heroItems = [
  { label: 'Upload your photo', Icon: IconUpload },
  { label: 'Instantly see it in bricks', Icon: IconTune },
  { label: 'Get the parts, guide, and price', Icon: IconAuto }
]

// (data now owned by components)

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

const email = ref('')
const subscribed = ref(false)
async function subscribe() {
  if (!email.value) return
  try {
    await subscribeEmail(email.value)
    subscribed.value = true
    email.value = ''
  } catch (e) {
    console.error(e)
    alert('Subscription failed. Try again later.')
  }
}
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative bg-brand-yellow">
      <div class="container mx-auto px-4 lg:px-6 py-20 md:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-[1fr,624px] gap-10 lg:gap-[30px] items-center">
        <!-- Left: copy -->
        <div class="relative z-10">
            <h1 class="text-[#343434] max-w-[18ch] mb-6 font-extrabold leading-tight text-[48px] md:text-7xl">
              Create LEGO-<br class="hidden md:block" />style art from your images
            </h1>

            <ul class="space-y-2 mb-6">
              <li v-for="h in heroItems" :key="h.label" class="flex items-center gap-3">
                <span class="inline-flex h-7 w-7 rounded-lg bg-[#FF0062] ring-1 ring-black/10 items-center justify-center">
                  <component :is="h.Icon" class="h-[18px] w-[18px] text-white" />
                </span>
                <span class="text-[#343434]">{{ h.label }}</span>
              </li>
            </ul>

            <div class="flex items-center gap-3">
              <NuxtLink
                to="/mosaic"
                class="btn-accent"
                aria-label="Start Photo to Bricks"
              >
                Try Photo to Bricks Now! →
              </NuxtLink>
              <NuxtLink
                to="/gallery"
                class="btn-outline-accent"
                aria-label="Explore the Briko gallery"
              >
                Explore Gallery
              </NuxtLink>
            </div>
            <p class="sr-only" :data-build="buildTag">build: {{ buildTag.slice(0,10) }}</p>
        </div>

        <!-- Right: hero compare -->
        <div class="flex justify-center lg:justify-end">
          <CompareSlider
            left="/home-1-original.jpg"
            right="/home-1-mosaic.png"
            aspect="16/9"
            :initial="50"
            class="max-w-[560px] md:max-w-[640px] md:justify-self-end"
          />
        </div>
      </div>
    </section>

    <!-- “Briko’s Geeky Superpowers” -->
    <section class="bg-[#FFD808]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 pt-0 pb-12 md:pb-16">
        <header class="text-center mb-8 md:mb-10">
          <h2 class="font-slab text-[28px] md:text-[32px] text-[#343434]">Briko’s Geeky Superpowers</h2>
          <p class="mt-2 text-[#343434]/75 text-[14px] md:text-[15px]">The tech that makes bricks feel instant.</p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <FeatureList />
      </div>
    </section>

    <!-- Purple band: spacing + structured content -->
    <section class="bg-[#2F3061] text-white">
      <div class="container mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <!-- heading block: breathing room -->
        <div class="text-center mb-10">
          <h2 class="font-slab text-2xl md:text-3xl">From Photo to Parts—Fast</h2>
          <p class="text-white/80 mt-2">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <span class="mt-3 inline-block h-1 w-16 rounded bg-[#FF0062]"></span>
        </div>

        <!-- content: image left, cards right -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div class="max-w-[720px]">
            <CompareSlider
              left="/home-2-mosaic.png"
              right="/home-2-original.jpg"
              aspect="4/3"
              :initial="50"
            />
          </div>

          <!-- 2×2 feature cards -->
          <FeaturePoints />
        </div>
      </div>
    </section>

    <!-- How it works -->
    <HowItWorks />

    <!-- Email capture block -->
    <section class="w-full bg-[#FFD808]/20 border-t border-[#2F3061]/10 py-12 mt-20">
      <div class="max-w-2xl mx-auto text-center px-4">
        <h2 class="text-2xl font-semibold text-[#2F3061] mb-4">Stay in the loop</h2>
        <p class="text-[#2F3061]/70 mb-6">Get featured builds and new parts packs.</p>
        <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3 justify-center">
          <input type="email" v-model="email" required placeholder="you@example.com"
            class="flex-1 rounded-xl p-3 border border-[#2F3061]/30 bg-white/80 focus:ring-2 focus:ring-[#2F3061] text-[#2F3061]" />
          <button type="submit"
            class="px-6 py-3 rounded-xl bg-[#2F3061] text-white font-medium hover:bg-[#403E7A] transition">
            Subscribe
          </button>
        </form>
        <p v-if="subscribed" class="mt-4 text-[#2F3061]">Thanks! You’re on the list. 💛</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
