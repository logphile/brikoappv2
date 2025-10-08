<template>
  <header ref="headerRef" class="app-header sticky top-0 z-50 bg-[#FFD808] backdrop-blur" style="--app-header-h: 56px;">
    <nav class="mx-auto max-w-7xl px-4 md:px-6">
      <div class="h-14 md:h-16 flex items-center justify-between">
        <!-- Brand -->
        <NuxtLink to="/" class="flex items-center gap-2 py-1">
          <img :src="BrikoIcon" class="h-8 w-8" alt="Briko" />
          <span class="logo-text text-pink text-[2rem]">Briko</span>
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
        <div class="flex items-center gap-4 shrink-0">
          <AccountMenu v-if="!loading && user" :label="identityLabel" />
          <NuxtLink v-else :to="{ path: '/login', query: { next: '/studio' } }"
            class="user-trigger inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 min-h-[40px]
                   bg-pink text-brandYellow font-medium
                   shadow-[0_2px_0_rgba(0,0,0,0.25)] transition-all duration-200
                   hover:shadow-[0_6px_14px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:translate-y-0
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
            <span class="material-symbols-rounded text-base" aria-hidden="true">account_circle</span>
            <span class="max-w-[200px] truncate">Log in</span>
          </NuxtLink>
          <!-- mobile menu button placeholder -->
          <button class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-pink/80 hover:text-pink hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50">
            <span class="material-symbols-rounded text-[20px]" aria-hidden="true">menu</span>
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

// Public URL (served from /public)
const BrikoIcon = '/brand/briko-icon.svg'
// const BrikoWordmark = '/brand/briko-wordmark.svg' // optional

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
