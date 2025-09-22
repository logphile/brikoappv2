<template>
  <div class="relative" ref="root">
    <button @click="toggle" class="inline-flex h-9 items-center rounded-md bg-transparent px-3 text-[15px] text-[#FF0062] hover:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062]/50">
      {{ label }}
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-64 z-50">
      <ul class="p-1 rounded-2xl border border-midnight shadow-xl w-64 relative overflow-hidden menu-surface" role="menu" aria-label="User menu">
        <li>
          <NuxtLink
            to="/projects"
            role="menuitem"
            :class="[rowCls, route.path.startsWith('/projects') ? 'font-semibold' : '']"
          >
            <img src="/icons/menu/yourprojects-mint.svg" alt="" class="menu-icon" />
            <span>Your Projects</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/gallery"
            role="menuitem"
            :class="[rowCls, route.path.startsWith('/gallery') ? 'font-semibold' : '']"
          >
            <img src="/icons/menu/communitygallery-mint.svg" alt="" class="menu-icon" />
            <span>Community Gallery</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/projects/new"
            role="menuitem"
            :class="[rowCls, route.path === '/projects/new' ? 'font-semibold' : '']"
          >
            <img src="/icons/menu/newproject-mint.svg" alt="" class="menu-icon" />
            <span>New Project</span>
          </NuxtLink>
        </li>

        <li><div class="my-1 h-px bg-midnight" /></li>

        <li>
          <NuxtLink
            to="/settings/profile"
            role="menuitem"
            :class="[rowCls, route.path.startsWith('/settings') ? 'font-semibold' : '']"
          >
            <img src="/icons/menu/settings-mint.svg" alt="" class="menu-icon" />
            <span>Settings</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/how-it-works"
            role="menuitem"
            :class="[rowCls, route.path.startsWith('/how-it-works') ? 'font-semibold' : '']"
          >
            <img src="/icons/menu/help-mint.svg" alt="" class="menu-icon" />
            <span>Help</span>
          </NuxtLink>
        </li>

        <li>
          <button type="button" @click="signOut" :class="[rowCls, 'text-left']" role="menuitem">
            <img src="/icons/menu/signout-mint.svg" alt="" class="menu-icon" />
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
  /* Solid ink surface: no glass, no bleed */
  background: #124559; /* midnight, fully opaque */
  isolation: isolate;                 /* prevent parent backdrop/mix effects */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.menu-icon{
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
  object-fit: contain;
}

.menu-surface--glassy {
  background: rgba(18, 69, 89, 0.85);
  -webkit-backdrop-filter: saturate(120%) blur(6px);
  backdrop-filter: saturate(120%) blur(6px);
}
</style>
