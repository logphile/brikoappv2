<template>
  <header ref="headerRef" class="app-header sticky top-0 z-50 bg-[#FFD808] backdrop-blur" style="--app-header-h: 56px;">
    <nav class="mx-auto max-w-7xl px-4 md:px-6">
      <div class="h-14 md:h-16 flex items-center justify-between">
        <!-- Brand -->
        <NuxtLink to="/" class="flex items-center gap-2 py-1">
          <img :src="BrikoIcon" class="h-8 w-8" alt="Briko" />
          <span class="logo-text font-slab text-pink text-[2.4rem] md:text-[2.8rem] tracking-tight">Briko</span>
        </NuxtLink>

        <!-- Main nav -->
        <ul class="flex flex-wrap gap-3 px-1 pr-3 sm:pr-4">
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
import { useProfile } from '@/composables/useProfile'
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
const { profile, loadProfile } = useProfile()

async function fetchProfile(){
  try { await loadProfile() } catch {}
}

const identityLabel = computed(() => {
  const p = profile.value
  if (p?.display_name && String(p.display_name).trim()) return String(p.display_name).trim()
  if (p?.handle && String(p.handle).trim()) return `@${String(p.handle).trim()}`
  const em = user.value?.email || ''
  return (em && em.includes('@')) ? em.split('@')[0] : (em || 'Account')
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
