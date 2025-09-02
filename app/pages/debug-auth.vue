<template>
  <main class="mx-auto max-w-xl px-6 py-10 text-white">
    <h1 class="text-xl font-bold mb-4">Auth Debug</h1>
    <p class="mb-2">supabaseUrl: {{ url ? '✅' : '❌' }} (len {{ (url||'').length }})</p>
    <p class="mb-2">supabaseAnonKey: {{ key ? '✅' : '❌' }} (len {{ (key||'').length }})</p>
    <p class="mb-2">client available: {{ !!$supabase }}</p>
    <p class="mb-2">user: {{ user || 'null' }}</p>
  </main>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const url = (config.public as any).supabaseUrl as string
const key = (config.public as any).supabaseAnonKey as string
const { $supabase } = useNuxtApp() as any
const user = (await $supabase?.auth.getUser())?.data?.user ?? null
</script>
