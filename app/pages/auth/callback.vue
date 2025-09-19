<template>
  <main class="mx-auto max-w-md px-6 py-12 text-white">
    <p class="opacity-80">Signing you in…</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNuxtApp, navigateTo } from 'nuxt/app'
import { useRoute } from 'vue-router'

const { $supabase } = useNuxtApp() as any
const route = useRoute()
const next = (route.query.next as string) || '/studio'

onMounted(async () => {
  try { await $supabase?.auth.exchangeCodeForSession(window.location.href) } catch {}
  navigateTo(next, { replace: true })
})
</script>
