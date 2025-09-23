<template>
  <div class="relative" ref="root">
    <button @click="toggle" class="inline-flex h-9 items-center rounded-md bg-transparent px-3 text-base text-[#FFD808] hover:text-[#FF0062] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062]/50 font-medium">
      {{ label }}
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-64 z-50">
      <ul class="menu-surface rounded-xl bg-[#2F3061] text-[#FFD808] shadow-lg p-2 w-64 relative overflow-hidden" role="menu" aria-label="User menu">
        <li>
          <NuxtLink
            to="/projects"
            role="menuitem"
            :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]', route.path.startsWith('/projects') ? 'font-semibold' : '']"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">folder_special</span>
            <span>Your Projects</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/gallery"
            role="menuitem"
            :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]', route.path.startsWith('/gallery') ? 'font-semibold' : '']"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">collections</span>
            <span>Community Gallery</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/projects/new"
            role="menuitem"
            :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]', route.path === '/projects/new' ? 'font-semibold' : '']"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">add_circle</span>
            <span>New Project</span>
          </NuxtLink>
        </li>

        <li><div class="my-1 h-px bg-white/20" /></li>

        <li>
          <NuxtLink
            to="/settings/profile"
            role="menuitem"
            :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]', route.path.startsWith('/settings') ? 'font-semibold' : '']"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">settings</span>
            <span>Settings</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/how-it-works"
            role="menuitem"
            :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]', route.path.startsWith('/how-it-works') ? 'font-semibold' : '']"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">help</span>
            <span>Help</span>
          </NuxtLink>
        </li>

        <li>
          <button type="button" @click="signOut" :class="[rowCls, 'group flex items-center gap-3 px-3 py-2 text-left text-[#FFD808] hover:text-[#FF0062] hover:bg-[#2F3061]']" role="menuitem">
            <span aria-hidden="true" class="material-symbols-rounded text-lg text-[#FFD808] group-hover:text-[#FF0062]">logout</span>
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
