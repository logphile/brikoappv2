<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <p class="opacity-80">Redirecting to shared view…</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, navigateTo } from 'nuxt/app'

const route = useRoute()

onMounted(() => {
  const id = String(route.params.id || '')
  if (id) navigateTo(`/s/${id}`, { replace: true })
})
</script>
