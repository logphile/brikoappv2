<template>
  <div class="relative" ref="root">
    <button @click="toggle" class="inline-flex h-9 items-center rounded-md bg-white/10 px-3 text-[15px] text-white/90 hover:bg-white/20 transition-colors">
      {{ label }}
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-64 z-50">
      <div class="rounded-2xl bg-white/5 border border-white/10 shadow-xl p-1" role="menu" aria-label="User menu">
        <nav class="py-1 text-sm text-white/90">
          <NuxtLink
            to="/projects"
            role="menuitem"
            class="menu-item"
            :class="route.path.startsWith('/projects') ? 'bg-white/8 text-white' : ''"
          >
            <img src="/icons/menu/yourprojects-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>Your Projects</span>
          </NuxtLink>

          <NuxtLink
            to="/gallery"
            role="menuitem"
            class="menu-item"
            :class="route.path.startsWith('/gallery') ? 'bg-white/8 text-white' : ''"
          >
            <img src="/icons/menu/communitygallery-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>Community Gallery</span>
          </NuxtLink>

          <NuxtLink
            to="/projects/new"
            role="menuitem"
            class="menu-item"
            :class="route.path === '/projects/new' ? 'bg-white/8 text-white' : ''"
          >
            <img src="/icons/menu/newproject-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>New Project</span>
          </NuxtLink>

          <div class="my-1 h-px bg-white/10" />

          <NuxtLink
            to="/settings/profile"
            role="menuitem"
            class="menu-item"
            :class="route.path.startsWith('/settings') ? 'bg-white/8 text-white' : ''"
          >
            <img src="/icons/menu/settings-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>Settings</span>
          </NuxtLink>

          <NuxtLink
            to="/how-it-works"
            role="menuitem"
            class="menu-item"
            :class="route.path.startsWith('/how-it-works') ? 'bg-white/8 text-white' : ''"
          >
            <img src="/icons/menu/help-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>Help</span>
          </NuxtLink>

          <button @click="signOut" class="menu-item" role="menuitem">
            <img src="/icons/menu/signout-mint.svg" alt="" aria-hidden="true" class="menu-icon" />
            <span>Sign out</span>
          </button>
        </nav>
      </div>
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
.menu-item {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90 hover:bg-white/7 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mintRing/70;
}
.menu-icon {
  @apply w-4 h-4 shrink-0;
}
</style>
