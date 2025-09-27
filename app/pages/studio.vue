<template>
  <main class="mx-auto max-w-7xl px-6 py-10 bg-[#FFD808] text-white">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">Briko Studio</h1>
        <p class="text-white/80 text-sm md:text-base">Start a new project or explore the community.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink to="/gallery" class="btn-outline-mint">Open Community Gallery</NuxtLink>
        <NuxtLink to="/projects/new" class="btn-mint">New Project</NuxtLink>
      </div>
    </header>

    <!-- Your Projects -->
    <section v-if="user && myItems.length" class="mt-10 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-soft-card">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Your Projects</h2>
        <div class="mt-1 h-1 w-10 rounded bg-mint/70"></div>
      </div>
      <TransitionGroup name="fadegrid" tag="div" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <NuxtLink v-for="p in myItems" :key="p.id" :to="`/projects/${p.id}`"
          class="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-sm transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_18px_50px_-16px_rgba(0,229,160,.45)]">
          <div class="framed-img aspect-[4/3] bg-black/30">
            <img v-if="p.cover_url" :src="p.cover_url" alt="" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-white/90 truncate">{{ p.title || 'Untitled' }}</h3>
              <span class="text-xs text-white/50">{{ new Date(p.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </NuxtLink>
      </TransitionGroup>
    </section>

    <!-- Community Projects -->
    <section class="mt-10 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-soft-card">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">Community Projects</h2>
          <div class="mt-1 h-1 w-10 rounded bg-mint/70"></div>
        </div>
        <NuxtLink to="/gallery" class="hidden sm:inline-flex btn-outline-mint">See all</NuxtLink>
      </div>

      <div v-if="loadingComm && commItems.length===0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div v-for="n in pageSize" :key="n" class="rounded-2xl h-40 bg-white/10 animate-pulse"></div>
      </div>
      <TransitionGroup v-else name="fadegrid" tag="div" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <ProjectCard v-for="p in commItems" :key="p.id" :project="p" @img-error="onCommImgError" />
      </TransitionGroup>
      <div class="mt-6 flex items-center justify-center gap-3">
        <NuxtLink to="/gallery" class="btn-outline-mint">Open Community Gallery</NuxtLink>
        <button v-if="hasMoreComm" @click="loadMoreComm" class="btn-outline-mint" :disabled="loadingComm">Load More</button>
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
