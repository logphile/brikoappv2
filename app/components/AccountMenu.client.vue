<template>
  <div class="relative" ref="root">
    <button
      @click="toggle"
      class="user-pill nav-enter"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
    >
      <span class="material-symbols-rounded text-base user-pill__icon" aria-hidden="true">account_circle</span>
      <span class="truncate max-w-[14ch] sm:max-w-[24ch]">{{ label || 'Sign in' }}</span>
      <span class="material-symbols-rounded text-base opacity-90 -mr-1" aria-hidden="true">expand_more</span>
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-64 z-50">
      <ul class="menu-surface rounded-2xl bg-[#2A2356] text-[#FFD808] shadow-2xl ring-1 ring-white/10 p-2 w-64 relative overflow-hidden" role="menu" aria-label="User menu">
        <li class="relative group">
          <NuxtLink
            to="/projects"
            role="menuitem"
            :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition', route.path.startsWith('/projects') ? 'font-semibold' : '']"
          >
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">folder_special</span>
            <span>My Gallery</span>
          </NuxtLink>
        </li>

        <li class="relative group">
          <NuxtLink
            to="/gallery"
            role="menuitem"
            :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition', route.path.startsWith('/gallery') ? 'font-semibold' : '']"
          >
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">collections</span>
            <span>Community Gallery</span>
          </NuxtLink>
        </li>

        <li class="relative group">
          <NuxtLink
            to="/projects/new"
            role="menuitem"
            :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition', route.path === '/projects/new' ? 'font-semibold' : '']"
          >
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">add_circle</span>
            <span>New Project</span>
          </NuxtLink>
        </li>

        <li><div class="my-1 h-px bg-white/15"></div></li>

        <li class="relative group">
          <NuxtLink
            to="/settings"
            role="menuitem"
            :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition', route.path.startsWith('/settings') ? 'font-semibold' : '']"
          >
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">settings</span>
            <span>Settings</span>
          </NuxtLink>
        </li>

        <li class="relative group">
          <NuxtLink
            to="/how-it-works"
            role="menuitem"
            :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition', route.path.startsWith('/how-it-works') ? 'font-semibold' : '']"
          >
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">help</span>
            <span>Help</span>
          </NuxtLink>
        </li>

        <li class="relative group">
          <button type="button" @click="signOut" :class="[rowCls, 'flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[#FFD808] bg-transparent hover:bg-white/10 focus:bg-white/10 transition']" role="menuitem">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition" aria-hidden="true"></span>
            <span aria-hidden="true" class="material-symbols-rounded h-4.5 w-4.5 text-lg text-[#FFD808]">logout</span>
            <span>Sign out</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ label: string }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const route = useRoute()
const { logout } = useAuth()
const router = useRouter()

const rowCls = 'menu-item'

function toggle(){ open.value = !open.value }

async function signOut(){
  open.value = false
  try { await logout() } catch {}
  router.push('/')
}

function onClickOutside(ev: MouseEvent){
  const el = root.value
  if (!el) return
  if (!el.contains(ev.target as Node)) open.value = false
}

onMounted(() => { document.addEventListener('click', onClickOutside) })
onBeforeUnmount(() => { document.removeEventListener('click', onClickOutside) })

// Auto-close menu on navigation
watch(() => route.fullPath, () => { open.value = false })
</script>

<style scoped>
.menu-surface{
  /* Strong branded surface: purple background */
  background: #2F3061;
  color: #FFD808;
  isolation: isolate;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* legacy icon style kept for compatibility if any <img> remains */
.menu-icon{
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
  object-fit: contain;
}
</style>
