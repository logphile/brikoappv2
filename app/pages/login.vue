<template>
  <main class="mx-auto max-w-md px-6 py-12 text-white">
    <h1 class="text-2xl font-semibold">Login</h1>
    <p class="opacity-80">Sign in via email magic link.</p>

    <form class="mt-6 space-y-3" @submit.prevent="submit">
      <label class="block text-sm">
        <span>Email</span>
        <input v-model="email" type="email" required class="mt-1 w-full rounded-xl bg-white/10 px-3 py-2" placeholder="you@example.com"/>
      </label>
      <button class="w-full py-2 rounded-xl bg-cta-grad disabled:opacity-50" :disabled="loading">
        {{ loading ? 'Sending…' : 'Send magic link' }}
      </button>
    </form>

    <p v-if="sent" class="mt-4 text-sm text-emerald-300">Magic link sent. Check your inbox.</p>
    <p v-if="error" class="mt-4 text-sm text-red-300">{{ error }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'

const { $supabase } = useNuxtApp() as any
const router = useRouter()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit(){
  error.value = ''
  if(!$supabase){ error.value='Auth unavailable'; return }
  loading.value = true
  const redirectTo = window.location.origin
  const { error: err } = await $supabase.auth.signInWithOtp({ email: email.value, options: { emailRedirectTo: redirectTo } })
  loading.value = false
  if(err){ error.value = err.message }
  else { sent.value = true }
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
