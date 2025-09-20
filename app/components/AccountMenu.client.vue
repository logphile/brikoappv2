<template>
  <div class="relative" ref="root">
    <button @click="toggle" class="inline-flex h-9 items-center rounded-md bg-white/10 px-3 text-[15px] text-white/90 hover:bg-white/20 transition-colors">
      {{ label }}
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0E13] ring-1 ring-white/10 shadow-lg overflow-hidden z-50">
      <nav class="py-2 text-sm text-white/90">
        <NuxtLink to="/projects" class="flex items-center px-3 py-2 hover:bg-white/10">Your Projects</NuxtLink>
        <NuxtLink to="/gallery" class="flex items-center px-3 py-2 hover:bg-white/10">Community Gallery</NuxtLink>
        <NuxtLink to="/projects/new" class="flex items-center px-3 py-2 hover:bg-white/10">New Project</NuxtLink>
        <hr class="my-2 border-white/10" />
        <NuxtLink to="/settings/profile" class="flex items-center px-3 py-2 hover:bg-white/10">Settings</NuxtLink>
        <NuxtLink to="/how-it-works" class="flex items-center px-3 py-2 hover:bg-white/10">Help</NuxtLink>
        <button @click="signOut" class="w-full text-left flex items-center px-3 py-2 hover:bg-white/10">Sign out</button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'nuxt/app'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ label: string }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const { logout } = useAuth()
const router = useRouter()

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
</script>
