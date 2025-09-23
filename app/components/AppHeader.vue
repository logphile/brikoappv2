<template>
  <header ref="headerRef" class="app-header sticky top-0 z-50 bg-[#FFD808] border-none backdrop-blur" style="--app-header-h: 56px;">
    <nav class="mx-auto max-w-7xl px-4 md:px-6">
      <div class="h-14 md:h-16 flex items-center justify-between">
        <!-- Brand -->
        <NuxtLink to="/" class="flex items-center gap-2 py-1">
          <img src="/brand/briko-icon.svg" class="h-8 w-8" alt="Briko" />
          <span class="logo-text text-[#FF0062] text-[2rem]">Briko</span>
        </NuxtLink>

        <!-- Main nav -->
        <ul class="flex items-center
                   gap-4 sm:gap-5 md:gap-6
                   px-1 pr-3 sm:pr-4
                   overflow-x-auto md:overflow-visible no-scrollbar">
          <li><NavBrick to="/mosaic" label="Photo to Bricks" /></li>
          <li><NavBrick to="/voxel" label="3D Builder" /></li>
          <li><NavBrick to="/avatar" label="Brick Yourself" /></li>
          <li><NavBrick to="/studio" label="Briko Studio" /></li>
        </ul>

        <!-- Account / CTA -->
        <div class="flex items-center gap-2">
          <AccountMenu v-if="!loading && user" :label="identityLabel" />
          <NuxtLink v-else :to="{ path: '/login', query: { next: '/studio' } }"
            class="hidden md:inline-flex h-9 items-center rounded-md px-3 text-base
                   bg-transparent text-[#FF0062] border-0 hover:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062]/50">
            Login
          </NuxtLink>
          <!-- mobile menu button placeholder -->
          <button class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-[#FF0062]/80 hover:text-[#FF0062] hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062]/50">
            <span class="i-lucide-menu h-5 w-5">≡</span>
          </button>
        </div>
      </div>
    </nav>
  </header>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useProfile, type ProfileRow } from '@/composables/useProfile'
import AccountMenu from '@/components/AccountMenu.client.vue'
import NavBrick from '@/components/NavBrick.vue'

const route = useRoute()
const items = [
  { name: 'Photo to Bricks', href: '/mosaic' },
  { name: '3D Builder',      href: '/voxel' },
  { name: 'Brick Yourself',  href: '/avatar' },
  { name: 'Briko Studio',    href: '/gallery' },
]
const isActive = (href: string) => route.path.startsWith(href)

const { user, loading, refreshUser } = useAuth()
const { getMyProfile } = useProfile()
const profile = ref<ProfileRow | null>(null)

async function fetchProfile(){
  try { profile.value = await getMyProfile() } catch {}
}

const identityLabel = computed(() => {
  const p = profile.value
  if (p?.handle && p.handle.trim()) return `@${p.handle.trim()}`
  if (p?.display_name && p.display_name.trim()) return p.display_name.trim()
  return user.value?.email || 'Account'
})

onMounted(() => {
  try { refreshUser() } catch {}
  fetchProfile()
})

watch(user, (u) => { if (u) fetchProfile(); else profile.value = null })

// Expose header height globally so overlays (toast host) can position below it.
const headerRef = ref<HTMLElement|null>(null)
function setRootHeaderVar(){
  try {
    const el = headerRef.value
    if (!el) return
    const h = el.getBoundingClientRect().height
    document.documentElement.style.setProperty('--app-header-h', `${Math.round(h)}px`)
  } catch {}
}
onMounted(() => {
  setRootHeaderVar()
  window.addEventListener('resize', setRootHeaderVar)
})
onBeforeUnmount(() => { window.removeEventListener('resize', setRootHeaderVar) })
</script>

<style>
/* Keep a single source of truth for header height via CSS var */
.app-header { --app-header-h: 56px; }
@media (min-width: 768px) {
  .app-header { --app-header-h: 64px; }
}
</style>
