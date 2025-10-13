<template>
  <main class="min-h-screen bg-yellow text-dark">
    <div class="page-wrap py-10 lg:py-12">
      <header class="mb-8">
        <h1 class="text-5xl lg:text-6xl font-slab">Briko Studio</h1>
        <p class="mt-2 text-[#34343A]/70">Start a new project or explore the community.</p>
        <div class="mt-4 flex items-center gap-3">
          <NuxtLink to="/gallery" class="btn-outline-ink">Community Gallery</NuxtLink>
          <NuxtLink to="/studio/new" class="btn-primary">New Project</NuxtLink>
        </div>
      </header>

      <!-- Your Projects -->
      <section class="mb-8">
        <div class="mt-10 mb-4">
          <div class="flex items-center gap-3">
            <span class="section-h">Your Projects</span>
            <div class="section-rule"></div>
          </div>
        </div>
        <div v-if="loadingMy" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
          <div v-for="n in 10" :key="`sk-${n}`" class="aspect-square rounded-2xl bg-white/70 animate-pulse"></div>
        </div>
        <ProjectGrid v-else-if="myItems.length" :items="myItems" view-prefix="/studio" />
        <div v-else class="mt-4">
          <div class="card p-8 flex items-center gap-4">
            <div class="rounded-full h-10 w-10 bg-[#34343A]/10 flex items-center justify-center">
              <span class="text-[#34343A]">+</span>
            </div>
            <div class="flex-1">
              <p class="font-medium">Create your first project</p>
              <p class="text-sm text-[#34343A]/70">Upload a photo and turn it into bricks in seconds.</p>
            </div>
            <NuxtLink to="/studio/new" class="btn-primary">New Project</NuxtLink>
          </div>
        </div>
      </section>

      <!-- Community Projects -->
      <section>
        <div class="mt-10 mb-4">
          <div class="flex items-center gap-3">
            <span class="section-h">Community Projects</span>
            <div class="section-rule"></div>
          </div>
        </div>
        <div v-if="loadingComm && commItems.length===0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
          <div v-for="n in pageSize" :key="`skc-${n}`" class="aspect-square rounded-2xl bg-white/70 animate-pulse"></div>
        </div>
        <ProjectGrid v-else-if="commItems.length" :items="commItems" more-link="/gallery" more-label="See all" />
        <div v-else class="text-center py-10">
          <p class="text-dim">No projects yet.</p>
          <NuxtLink to="/gallery" class="btn-outline-ink mt-4">Browse the Community Gallery</NuxtLink>
        </div>
        <div v-if="hasMoreComm" class="mt-6 flex justify-center">
          <button @click="loadMoreComm" :disabled="loadingComm" class="btn-outline-ink">Load More</button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp, useHead } from 'nuxt/app'
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T
import { useProjects } from '@/composables/useProjects'
import ProjectGrid from '@/components/ProjectGrid.vue'
// Removed MyGalleryGrid to avoid duplicating owner gallery on Studio page

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false, middleware: ['auth'] })

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

const supabase = useSupabaseClient<any>()
const { buildPreviewUrl } = useProjects()

const user = ref<any>(null)

// Your Projects
const myItems = ref<any[]>([])
const loadingMy = ref(false)

// My Gallery is rendered via <MyGalleryGrid />

// Community
const commItems = ref<any[]>([])
const loadingComm = ref(false)
const pageSize = 15
let commPage = 0
const hasMoreComm = ref(true)

function bust(ts?: any){ try{ return new Date(ts || Date.now()).getTime() }catch{ return Date.now() } }

async function fetchUser(){
  if(!supabase) return
  const { data } = await supabase.auth.getUser()
  user.value = data?.user || null
}

async function fetchMy(){
  if(!supabase || !user.value) return
  loadingMy.value = true
  // Prefer new schema 'user_projects', fallback to 'projects'
  let rows: any[] = []
  try {
    const { data, error } = await supabase.from('user_projects')
      .select('id, title, preview_path, created_at, updated_at')
      .eq('user_id', user.value.id)
      .order('updated_at', { ascending: false })
      .limit(100)
    if (error) throw error
    rows = data || []
  } catch (e) {
    // Fallback to base projects table using modern column names
    const { data } = await supabase.from('projects')
      .select('id, name as title, preview_path, created_at, updated_at')
      .eq('user_id', user.value.id)
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
  if(!supabase) { hasMoreComm.value = false; return }
  loadingComm.value = true
  const from = commPage * pageSize
  const to = from + pageSize - 1
  const { data, error } = await supabase
    .from('user_projects_public')
    .select('id, title, kind, preview_path, created_at, updated_at')
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
