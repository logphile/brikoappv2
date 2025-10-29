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
import CompareSlider from '~/components/home/CompareSlider.vue'

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
const notice = ref('')
const busy = ref(false)
async function handleSubscribe() {
  const emailVal = email.value?.trim()
  if (!emailVal) { notice.value = 'Please enter a valid email.'; return }
  busy.value = true
  notice.value = ''
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: emailVal })
    })
    let data: any = null
    try { data = await res.json() } catch {}
    if (res.ok) {
      subscribed.value = true
      email.value = ''
      return
    }
    const code = data?.code
    if (code === 'INVALID_EMAIL') { notice.value = 'Please enter a valid email.'; return }
    if (code === 'DB') { notice.value = 'Already subscribed or temporarily unavailable.'; return }
    if (code === 'WRONG_KEY') { notice.value = 'Server config issue detected. Try again later.'; return }
    if (code === 'CONFIG_MISSING') { notice.value = 'Server missing config. Try again later.'; return }
    notice.value = 'Subscription failed. Try again later.'
  } catch (e) {
    console.error('[subscribe] client error', e)
    notice.value = 'Network issue. Try again in a bit.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative bg-brand-yellow">
      <div class="container mx-auto px-4 lg:px-6 py-20 md:py-24 lg:py-28 grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1fr_1fr]">
        <!-- Left: copy -->
        <div class="relative z-10">
            <h1 class="text-[#343434] max-w-[18ch] font-extrabold tracking-tight text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] lg:space-y-[6px] mb-10">
              <span>Create LEGO-</span>
              <span class="lg:block">style art from</span>
              <span class="lg:block">your images</span>
            </h1>

            <ul class="mt-[12px] lg:mt-[15px] space-y-2 mb-6">
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

        <!-- RIGHT COLUMN — TOP HERO COMPARE -->
        <div class="w-full md:justify-self-end">
          <CompareSlider
            left="/home-1-original.jpg"
            right="/home-1-mosaic.png"
            :initial="50"
            aspect="4/3"
            class="w-full
                   md:max-w-[640px]
                   lg:max-w-[720px]
                   xl:max-w-[840px]
                   2xl:max-w-[920px]"
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
          <!-- LEFT COLUMN — PURPLE SECTION COMPARE -->
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
        <h2 class="text-2xl font-semibold text-[#2F3061] mb-4">Join the build.</h2>
        <p class="text-[#2F3061]/70 mb-6">Get featured builds and new parts packs.</p>
        <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-3 justify-center">
          <!-- honeypot: hidden text field that must remain empty -->
          <input type="text" tabindex="-1" aria-hidden="true" autocomplete="off"
            class="sr-only" style="position:absolute;left:-10000px" />
          <input type="email" v-model="email" required placeholder="you@example.com"
            class="flex-1 rounded-xl p-3 border border-[#2F3061]/30 bg-white/80 focus:ring-2 focus:ring-[#2F3061] text-[#2F3061]" />
          <button type="submit" :disabled="busy"
            class="px-6 py-3 rounded-xl bg-[#2F3061] text-white font-medium hover:bg-[#403E7A] transition disabled:opacity-60 disabled:cursor-not-allowed">
            Subscribe
          </button>
        </form>
        <p v-if="notice && !subscribed" class="mt-3 text-sm text-red-600" aria-live="polite">{{ notice }}</p>
        <p v-if="subscribed" class="mt-4 text-[#2F3061] flex items-center gap-1">Thanks! You’re on the list. <span class="text-[#FF0062]">🧱</span></p>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
