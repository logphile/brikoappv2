<template>
  <header class="sticky top-0 z-50 bg-[#0B0E13]/95 border-b border-white/5 backdrop-blur">
    <nav class="mx-auto max-w-7xl px-4 md:px-6">
      <div class="h-14 md:h-16 flex items-center justify-between">
        <!-- Brand -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/brand/briko-icon-mono.svg" class="h-6 w-6 md:h-7 md:w-7" alt="" />
          <span class="text-white font-semibold text-lg md:text-xl">Briko</span>
        </NuxtLink>

        <!-- Main nav -->
        <ul class="hidden md:flex items-center gap-3 lg:gap-5">
          <li v-for="item in items" :key="item.href">
            <NuxtLink
              :to="item.href"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              class="group relative inline-flex items-center px-3 py-2 rounded-lg
                     text-[15px] lg:text-base font-medium
                     text-white/75 hover:text-white transition-colors
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-[#00E5A0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E13]">
              {{ item.name }}
              <!-- mint underbar -->
              <span
                class="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-0
                       rounded-full bg-[#00E5A0] transition-all duration-200
                       group-hover:w-3/5"
                :class="isActive(item.href) ? 'w-3/5' : ''"></span>
              <!-- subtle pill hover bg -->
              <span class="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </NuxtLink>
          </li>
        </ul>

        <!-- Account / CTA -->
        <div class="flex items-center gap-2">
          <NuxtLink v-if="!loading && user" to="/login"
            class="hidden md:inline-flex h-9 items-center rounded-md bg-white/10 px-3 text-[15px]
                   text-white/90 hover:bg-white/15 transition-colors">
            {{ user.email }}
          </NuxtLink>
          <NuxtLink v-else to="/login"
            class="hidden md:inline-flex h-9 items-center rounded-md bg-white/10 px-3 text-[15px]
                   text-white/90 hover:bg-white/15 transition-colors">
            Login
          </NuxtLink>
          <!-- mobile menu button placeholder -->
          <button class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10">
            <span class="i-lucide-menu h-5 w-5">≡</span>
          </button>
        </div>
      </div>
    </nav>
  </header>
  
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const items = [
  { name: 'Photo to Bricks', href: '/mosaic' },
  { name: '3D Builder',      href: '/voxel' },
  { name: 'Brick Yourself',  href: '/avatar' },
  { name: 'Briko Studio',    href: '/studio' },
]
const isActive = (href: string) => route.path.startsWith(href)

const { user, loading, refreshUser } = useAuth()
onMounted(() => { try { refreshUser() } catch {} })
</script>
