<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <h1 class="text-2xl font-semibold">Briko Studio</h1>
    <p class="opacity-80 text-sm">Loading your Studio…</p>
    <div class="mt-6 text-sm">
      <p>If you are not redirected, go to <NuxtLink to="/community-studio" class="underline">Community Studio</NuxtLink> or <NuxtLink to="/projects" class="underline">Your Projects</NuxtLink>.</p>
    </div>
  </main>
  
  <!-- noscript fallback -->
  <noscript>
    <div class="mx-auto max-w-5xl px-6 py-6 text-white/80">
      JavaScript is required to load your Studio. Visit <a href="/community-studio" class="underline">Community Studio</a>.
    </div>
  </noscript>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useNuxtApp, useHead } from 'nuxt/app'

// SEO
useHead({
  title: 'Briko Studio',
  meta: [
    { name: 'description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { property: 'og:title', content: 'Briko Studio | Briko' },
    { property: 'og:description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://briko.app/studio' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Briko Studio | Briko' },
    { name: 'twitter:description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/studio' }
  ]
})

const router = useRouter()
const { $supabase } = useNuxtApp() as any

onMounted(async () => {
  try {
    if (!$supabase) {
      await router.replace('/community-studio')
      return
    }
    const { data } = await $supabase.auth.getUser()
    if (data?.user) await router.replace('/projects')
    else await router.replace('/community-studio')
  } catch {
    await router.replace('/community-studio')
  }
})
</script>
