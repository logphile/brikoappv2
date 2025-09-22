<template>
  <header class="w-full bg-[#FFD808] border-none backdrop-blur sticky top-0 z-40">
    <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div aria-hidden="true" class="h-7 w-7 rounded-xl bg-cta-grad ring-1 ring-white/10"></div>
        <span class="text-lg font-semibold tracking-tight">Briko</span>
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm text-white/80">
        <NuxtLink to="/mosaic" class="hover:text-white">Mosaic</NuxtLink>
        <NuxtLink to="/avatar" class="hover:text-white">Avatar</NuxtLink>
        <NuxtLink to="/gallery" class="hover:text-white">Gallery</NuxtLink>
        <NuxtLink to="/projects" class="hover:text-white">Projects</NuxtLink>
        <div v-if="loading" class="opacity-60 text-sm">…</div>
        <NuxtLink v-else-if="!user" to="/login" class="btn-secondary">Login</NuxtLink>
        <div v-else class="flex items-center gap-3">
          <span class="hidden sm:inline">{{ user?.email }}</span>
          <button @click="logout" class="px-3 py-1.5 rounded-xl border border-midnight hover:shadow-mint-glow">Logout</button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { user, loading, logout } = useAuth()
</script>

<style scoped>
.header-link:global(.router-link-active){
  color: #fff;
}
</style>
