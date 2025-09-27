<template>
  <main class="mx-auto max-w-7xl px-6 py-10 bg-[#FFD808] text-white">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">Briko Studio</h1>
        <p class="text-white/80 text-sm md:text-base">Start a new project or explore the community.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink to="/community-studio" class="px-4 py-2 rounded-2xl border border-[#00E5A0]/60 text-[#00E5A0] shadow-[0_0_0_1px_rgba(0,229,160,0.25)] hover:shadow-[0_0_20px_rgba(0,229,160,0.35)] transition">Community Studio</NuxtLink>
        <NuxtLink to="/projects/new" class="px-4 py-2 rounded-2xl text-ink font-medium bg-gradient-to-r from-[#00E5A0] to-[#4FF3C3] shadow-[0_8px_24px_rgba(0,229,160,0.35)] hover:shadow-[0_12px_28px_rgba(0,229,160,0.45)] transition">New Project</NuxtLink>
      </div>
    </header>

    <!-- Your Projects -->
    <section v-if="user && myItems.length" class="mt-10 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-soft-card">
      <div class="mb-4">
        <h2 class="text-[28px] font-bold tracking-tight mb-3">Your Projects</h2>
        <div class="h-1 w-16 bg-[#00E5A0] rounded-full mb-4"></div>
      </div>
      <TransitionGroup name="fadegrid" tag="div" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div v-for="p in myItems" :key="p.id" class="group relative rounded-2xl border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-white/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.16)] transition overflow-hidden">
          <div class="rounded-xl overflow-hidden aspect-square bg-[#1F2A44]">
            <img v-if="p.cover_url" :src="p.cover_url" alt="" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
          </div>
          <div class="px-3 pb-3">
            <div class="mt-2 flex items-center gap-2">
              <h3 class="text-[14px] font-medium text-black/80 truncate">{{ p.title || 'Untitled' }}</h3>
              <span class="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-black/5 text-black/60">{{ new Date(p.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
          <!-- Hover overlay actions -->
          <div class="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition">
            <div class="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition">
              <NuxtLink :to="`/projects/${p.id}`" class="pointer-events-auto px-3 py-1.5 rounded-2xl text-ink font-medium bg-gradient-to-r from-[#00E5A0] to-[#4FF3C3] shadow-[0_8px_24px_rgba(0,229,160,0.35)] hover:shadow-[0_12px_28px_rgba(0,229,160,0.45)] transition">View</NuxtLink>
              <NuxtLink to="/mosaic" class="pointer-events-auto px-3 py-1.5 rounded-2xl border border-[#00E5A0]/60 text-[#00E5A0] shadow-[0_0_0_1px_rgba(0,229,160,0.25)] hover:shadow-[0_0_20px_rgba(0,229,160,0.35)] transition">Remix</NuxtLink>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </section>

    <!-- Community Projects -->
    <section class="mt-10 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-soft-card">
      <div class="mb-4">
        <h2 class="text-[28px] font-bold tracking-tight mb-3">Community Projects</h2>
        <div class="h-1 w-16 bg-[#00E5A0] rounded-full mb-4"></div>
      </div>

      <div v-if="loadingComm && commItems.length===0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div v-for="n in pageSize" :key="n" class="rounded-2xl h-40 bg-white/10 animate-pulse"></div>
      </div>
      <TransitionGroup v-else name="fadegrid" tag="div" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <ProjectCard v-for="p in commItems" :key="p.id" :project="p" overlay @img-error="onCommImgError" />
      </TransitionGroup>
      <div class="mt-6">
        <button v-if="hasMoreComm" @click="loadMoreComm" :disabled="loadingComm" class="mt-6 mx-auto block px-4 py-2 rounded-2xl border border-[#00E5A0]/60 text-[#00E5A0] hover:shadow-[0_0_20px_rgba(0,229,160,0.35)]">Load More</button>
        <NuxtLink v-else to="/gallery" class="mt-6 mx-auto block px-4 py-2 rounded-2xl border border-[#00E5A0]/60 text-[#00E5A0] hover:shadow-[0_0_20px_rgba(0,229,160,0.35)]">See All</NuxtLink>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp, useHead } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'
import ProjectCard from '@/components/ProjectCard.vue'

// SEO
useHead({
  title: 'Briko Studio',
  meta: [
    { name: 'description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { property: 'og:title', content: 'Briko Studio | Briko' },
    { property: 'og:description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://briko.app/studio' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Briko Studio | Briko' },
    { name: 'twitter:description', content: 'Your creative hub — explore community builds or manage your own projects.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/studio' }
  ]
})

const { $supabase } = useNuxtApp() as any
const { buildPreviewUrl } = useProjects()

const user = ref<any>(null)

// Your Projects
const myItems = ref<any[]>([])
const loadingMy = ref(false)

// Community
const commItems = ref<any[]>([])
const loadingComm = ref(false)
const pageSize = 15
let commPage = 0
const hasMoreComm = ref(true)

function bust(ts?: any){ try{ return new Date(ts || Date.now()).getTime() }catch{ return Date.now() } }

async function fetchUser(){
  if(!$supabase) return
  const { data } = await $supabase.auth.getUser()
  user.value = data?.user || null
}

async function fetchMy(){
  if(!$supabase || !user.value) return
  loadingMy.value = true
  // Prefer new schema 'user_projects', fallback to 'projects'
  let rows: any[] = []
  try {
    const { data, error } = await $supabase.from('user_projects')
      .select('id, title, preview_path, created_at, updated_at')
      .eq('user_id', user.value.id)
      .order('updated_at', { ascending: false })
      .limit(100)
    if (error) throw error
    rows = data || []
  } catch (e) {
    // Fallback to legacy table
    const { data } = await $supabase.from('projects')
      .select('id, title, preview_path, created_at, updated_at, owner')
      .eq('owner', user.value.id)
      .order('updated_at', { ascending: false })
      .limit(100)
    rows = data || []
  }
  myItems.value = rows.map((r:any) => ({
    id: r.id,
    title: r.title,
    created_at: r.updated_at || r.created_at,
    cover_url: r.preview_path ? `${buildPreviewUrl(r.preview_path)}?v=${bust(r.updated_at || r.created_at)}` : null,
  }))
  loadingMy.value = false
}

function onCommImgError(_id?: string | number){ /* handled by ProjectCard visuals */ }

async function fetchCommPage(){
  if(!$supabase) { hasMoreComm.value = false; return }
  loadingComm.value = true
  const from = commPage * pageSize
  const to = from + pageSize - 1
  const { data, error } = await $supabase
    .from('user_projects_public')
    .select('id, title, kind, preview_path, created_at, updated_at, handle, display_name')
    .order('created_at', { ascending: false })
    .range(from, to)
  if(!error){
    const list = (data || []) as any[]
    const mapped = list.map(p => ({
      id: p.id,
      title: p.title,
      created_at: p.created_at,
      cover_url: p.preview_path ? `${buildPreviewUrl(p.preview_path)}?v=${bust(p.updated_at || p.created_at)}` : null,
      owner: { handle: p.handle || null, display_name: p.display_name || null }
    }))
    commItems.value.push(...mapped)
    if(list.length < pageSize) hasMoreComm.value = false
    commPage++
  } else {
    hasMoreComm.value = false
    console.warn('[studio] community projects error', error)
  }
  loadingComm.value = false
}

function loadMoreComm(){ if(hasMoreComm.value && !loadingComm.value) fetchCommPage() }

onMounted(async () => {
  await fetchUser()
  if (user.value) fetchMy()
  fetchCommPage()
})
</script>

<style scoped>
.fadegrid-enter-active, .fadegrid-leave-active { transition: all .25s ease; }
.fadegrid-enter-from, .fadegrid-leave-to { opacity: 0; transform: translateY(6px); }
</style>
