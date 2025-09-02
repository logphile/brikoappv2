<template>
  <main class="mx-auto max-w-md px-6 py-12 text-white">
    <h1 class="text-2xl font-semibold mb-2">Login</h1>
    <p class="opacity-80 mb-6">Enter your email and we’ll send a one-time login link.</p>

    <form class="space-y-3" @submit.prevent="submit">
      <label class="block text-sm">
        <span>Email</span>
        <input v-model="email" type="email" required class="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2" placeholder="you@example.com"/>
      </label>
      <button class="w-full py-2 rounded-xl bg-cta-grad disabled:opacity-50" :disabled="sent || loading">
        {{ sent ? 'Link sent — check email' : (loading ? 'Sending…' : 'Send magic link') }}
      </button>
    </form>

    <p v-if="error" class="mt-4 text-sm text-red-300">{{ error }}</p>
  </main>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { loginWithMagicLink } = useAuth()
const { $supabase } = useNuxtApp() as any

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function submit(){
  error.value = null
  try {
    loading.value = true
    await loginWithMagicLink(email.value.trim())
    sent.value = true
  } catch (e: any) {
    error.value = e?.message || 'Failed to send link'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if(!$supabase) return
  // Handle magic-link callback if present
  try { await $supabase.auth.exchangeCodeForSession(window.location.href) } catch {}
  // If already logged in, redirect to projects
  const { data } = await $supabase.auth.getUser()
  if(data.user) router.push('/projects')
})
</script>
