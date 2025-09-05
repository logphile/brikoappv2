<template>
  <header class="w-full border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
    <nav class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between text-white">
      <NuxtLink to="/" class="font-bold text-xl">Briko</NuxtLink>
      <div class="flex items-center gap-4 text-sm">
        <NuxtLink to="/mosaic" class="hover:underline" title="Turn any photo into brick art in seconds.">Photo to Bricks</NuxtLink>
        <NuxtLink to="/voxel" class="hover:underline" title="Build and explore your creation in 3D.">3D Builder</NuxtLink>
        <NuxtLink to="/avatar" class="hover:underline" title="Make a fun brick avatar of you.">Brick Yourself</NuxtLink>
        <NuxtLink to="/studio" class="hover:underline" title="Your creative hub — explore builds and save your own.">Briko Studio</NuxtLink>
        <div class="h-5 w-px bg-white/20 mx-1"></div>
        <div v-if="loading" class="opacity-70">…</div>
        <NuxtLink v-else-if="!user" to="/login" class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Login</NuxtLink>
        <div v-else class="relative">
          <button @click="open = !open" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2">
            <span class="hidden sm:inline">{{ user?.email }}</span>
            <span class="sm:hidden">Account</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-80"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div v-if="open" class="absolute right-0 mt-2 w-48 rounded-lg bg-black/90 ring-1 ring-white/15 p-1 shadow-lg">
            <NuxtLink to="/account/login" class="block px-3 py-2 rounded hover:bg-white/10">Settings</NuxtLink>
            <button @click="logoutAndClose" class="w-full text-left px-3 py-2 rounded hover:bg-white/10">Sign out</button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
const { user, loading, logout, refreshUser } = useAuth()
const open = ref(false)
function logoutAndClose(){ open.value = false; logout() }
onMounted(() => { refreshUser() })
</script>
