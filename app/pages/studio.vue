<template>
  <main class="min-h-screen bg-yellow text-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <header class="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold">Briko Studio</h1>
          <p class="mt-2 text-dim">Start a new project or explore the community.</p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink to="/gallery" class="btn-purple-outline focus-cyber">Community Gallery</NuxtLink>
          <NuxtLink to="/studio/new" class="btn-pink focus-cyber">New Project</NuxtLink>
        </div>
      </header>

      <!-- Your Projects -->
      <section class="card-ivory p-4 sm:p-6 mb-8">
        <SectionHeader title="Your Projects" />
        <div v-if="loadingMy" class="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in 10" :key="`sk-${n}`" class="aspect-square rounded-2xl bg-white/70 animate-pulse"></div>
        </div>
        <ProjectGrid v-else-if="myItems.length" :items="myItems" />
        <div v-else class="text-center py-10">
          <p class="text-dim">No projects yet.</p>
          <NuxtLink to="/studio/new" class="btn-pink mt-4 focus-cyber">Create your first project</NuxtLink>
        </div>
      </section>

      <!-- My Gallery (gallery_posts) -->
      <section class="card-ivory p-4 sm:p-6 mb-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[var(--dark)]">My Gallery</h2>
          <span class="text-sm text-[color:var(--dark)/.7]">{{ myGallery.length }} item(s)</span>
        </div>

        <div v-if="isLoadingGallery" class="text-[color:var(--dark)/.7]">Loading…</div>

        <div v-else-if="!myGallery.length" class="text-[color:var(--dark)/.7]">
          Nothing here yet. Use <em>Save to Gallery</em> on your builds.
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <article v-for="g in myGallery" :key="g.id" class="rounded-2xl overflow-hidden border border-[color:var(--ivory-border)] bg-white shadow-soft-card">
            <img :src="g.image_url" alt="" class="aspect-square object-cover w-full" />
            <div class="p-3 flex items-center justify-between">
              <div class="truncate font-medium text-[var(--dark)]" :title="g.title">{{ g.title }}</div>
              <span
                class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="g.is_public ? 'bg-[#FF0062]/10 text-[#FF0062]' : 'bg-black/10 text-black/70'"
              >{{ g.is_public ? 'Public' : 'Private' }}</span>
            </div>
            <div class="px-3 pb-3 text-xs text-black/50">{{ new Date(g.created_at).toLocaleString() }}</div>
          </article>
        </div>
      </section>

      <!-- Community Projects -->
      <section class="card-ivory p-4 sm:p-6">
        <SectionHeader title="Community Projects" />
        <div v-if="loadingComm && commItems.length===0" class="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in pageSize" :key="`skc-${n}`" class="aspect-square rounded-2xl bg-white/70 animate-pulse"></div>
        </div>
        <ProjectGrid v-else-if="commItems.length" :items="commItems" more-link="/gallery" more-label="See all" />
        <div v-else class="text-center py-10">
          <p class="text-dim">No projects yet.</p>
          <NuxtLink to="/gallery" class="btn-purple-outline mt-4 focus-cyber">Browse the Community Gallery</NuxtLink>
        </div>
        <div v-if="hasMoreComm" class="mt-6 flex justify-center">
          <button @click="loadMoreComm" :disabled="loadingComm" class="btn-purple-outline focus-cyber">Load More</button>
        </div>
      </section>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { useNuxtApp, useHead } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'
import SectionHeader from '@/components/SectionHeader.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import { fetchMyGalleryPosts } from '@/composables/useMyGallery'

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

// My Gallery (gallery_posts)
const isLoadingGallery = ref(true)
const myGallery = ref<Awaited<ReturnType<typeof fetchMyGalleryPosts>>>([])

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
  // Load My Gallery
  myGallery.value = await fetchMyGalleryPosts()
  isLoadingGallery.value = false
  fetchCommPage()
})

// Realtime: refresh My Gallery on any change to gallery_posts (server-side RLS limits to my rows)
let galleryChannel: any = null
watchEffect(() => {
  if (!$supabase) return
  if (galleryChannel) return
  galleryChannel = $supabase
    .channel('gallery_posts_my')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_posts' }, async () => {
      myGallery.value = await fetchMyGalleryPosts()
    })
    .subscribe()
})

onBeforeUnmount(() => {
  try { if (galleryChannel) $supabase.removeChannel?.(galleryChannel) } catch {}
})
</script>

<style scoped>
.fadegrid-enter-active, .fadegrid-leave-active { transition: all .25s ease; }
.fadegrid-enter-from, .fadegrid-leave-to { opacity: 0; transform: translateY(6px); }
</style>
