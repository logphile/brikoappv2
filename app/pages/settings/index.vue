<script setup lang="ts">
// Redirect /settings -> /settings/profile to satisfy prerender crawl
definePageMeta({ redirect: '/settings/profile' })
</script>

<template>
  <main class="mx-auto max-w-xl px-6 py-10 text-white">
    <p>Redirecting to <NuxtLink to="/settings/profile" class="underline">Profile settings</NuxtLink>…</p>
  </main>
</template>
