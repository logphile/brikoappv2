<template>
  <Transition appear enter-active-class="transition ease-out duration-600"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0">
  <main class="mx-auto max-w-md px-6 py-12 text-white">
    <h1 class="text-2xl font-semibold mb-2">Login</h1>
    <p class="opacity-80 mb-6">Enter your email and we’ll send a one-time login link.</p>

    <form class="space-y-3" @submit.prevent="submit">
      <label class="block text-sm">
        <span>Email</span>
        <input v-model="email" type="email" required class="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2" placeholder="you@example.com"/>
      </label>
      <button class="btn-pink focus-cyber w-full" :disabled="sent || loading">
        {{ sent ? 'Link sent — check email' : (loading ? 'Sending…' : 'Send magic link') }}
      </button>
    </form>

    <div class="my-4 flex items-center gap-3 text-white/60">
      <div class="h-px flex-1 bg-white/10"></div>
      <span class="text-xs">or</span>
      <div class="h-px flex-1 bg-white/10"></div>
    </div>

    <button class="btn-pink focus-cyber w-full" @click="loginWithGoogle">
      Continue with Google
    </button>

    <p v-if="error" class="mt-4 text-sm text-red-300">{{ error }}</p>
  </main>
  </Transition>
  </template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useNuxtApp, useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const router = useRouter()
const route = useRoute()
const { loginWithMagicLink } = useAuth()
const { $supabase } = useNuxtApp() as any

// SEO
useHead({
  title: 'Login',
  meta: [
    { name: 'robots', content: 'noindex,follow' },
    { name: 'description', content: 'Sign in to Briko to save projects, share your creations, and unlock premium features.' },
    { property: 'og:title', content: 'Login | Briko' },
    { property: 'og:description', content: 'Sign in to Briko to save projects, share your creations, and unlock premium features.' },
    { property: 'og:url', content: 'https://briko.app/login' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Login | Briko' },
    { name: 'twitter:description', content: 'Sign in to Briko to save projects, share your creations, and unlock premium features.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/login' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const loginWebPage = webPageJsonLd(
  siteUrl,
  '/login',
  'Login',
  'Sign in to Briko to save projects, share your creations, and unlock premium features.'
)
const loginBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(loginWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(loginBreadcrumbs) }
  ]
})

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

const nextPath = computed(() => (route.query.next as string) || '/studio')
const redirectTo = computed(() => {
  const origin = process.client ? window.location.origin : ''
  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath.value)}`
})

async function submit(){
  error.value = null
  try {
    loading.value = true
    await loginWithMagicLink(email.value.trim(), redirectTo.value)
    sent.value = true
  } catch (e: any) {
    error.value = e?.message || 'Failed to send link'
  } finally {
    loading.value = false
  }
}

async function loginWithGoogle(){
  try {
    const rt = redirectTo.value
    await $supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: rt, queryParams: { prompt: 'consent' } }
    })
  } catch (e: any) {
    error.value = e?.message || 'Google login failed'
  }
}

onMounted(async () => {
  if(!$supabase) return
  // Handle magic-link callback if present
  try { await $supabase.auth.exchangeCodeForSession(window.location.href) } catch {}
  // If already logged in, redirect to projects
  const { data } = await $supabase.auth.getUser()
  if(data.user) router.push(nextPath.value)
})
</script>
