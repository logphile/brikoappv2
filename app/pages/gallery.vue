<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-[#343434]">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Community Gallery</h1>
        <p class="opacity-80 text-sm">Public remixes and builds shared by the community.</p>
        <InlineLoginBanner />
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <button v-for="s in sorts" :key="s" @click="setSort(s)" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" :class="{ 'bg-white/10': sort===s }">{{ s }}</button>
      </div>
    </header>

    <section class="mt-6 grid gap-4">
      <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <div class="flex items-center gap-2">
            <span class="opacity-75">Kind:</span>
            <button v-for="k in kinds" :key="k" @click="setKind(k)" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 capitalize" :class="{ 'bg-white/10': kind===k }">{{ k }}</button>
          </div>
          <div class="grow min-w-[260px]">
            <TagPicker :model-value="selectedTags" :suggestions="tagSuggestions" placeholder="Filter by tag…" hint="Press Enter to create a new tag" @create="createTag" @select="addTag" @remove="removeTag" @search="searchTags" />
          </div>
        </div>
      </div>

      <div v-if="loading" class="opacity-70">Loading…</div>
      <div v-else>
        <p v-if="isEmptyLive && showSeeds" class="mb-3 text-sm text-[#343434]/80">Showing sample projects — log in to share your own build!</p>
        <GalleryGrid :items="visibleItems" :liked-by-me-map="likedByMeMap" :saved-by-me-map="savedByMeMap" @like="likeItem" @unlike="unlikeItem" @save="saveItem" @unsave="unsaveItem" @remix="remixItem" @share="shareItem" />
        <div v-if="visibleItems.length === 0" class="opacity-70 mt-6">No results.</div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp, useHead, useRuntimeConfig } from 'nuxt/app'
import { useToasts } from '@/composables/useToasts'
import GalleryGrid from '@/components/gallery/GalleryGrid.vue'
import TagPicker, { type TagItem } from '@/components/tags/TagPicker.vue'
import seedsRaw from '@/data/gallery_seeds.json'
import { useProjects } from '@/composables/useProjects'
import InlineLoginBanner from '@/components/studio/InlineLoginBanner.vue'

// SEO
useHead({
  title: 'Community Gallery',
  meta: [
    { name: 'description', content: 'Explore public remixes and builds from the Briko community.' },
    { property: 'og:title', content: 'Community Gallery | Briko' },
    { property: 'og:description', content: 'Explore public remixes and builds from the Briko community.' },
    { property: 'og:url', content: 'https://briko.app/gallery' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Community Gallery | Briko' },
    { name: 'twitter:description', content: 'Explore public remixes and builds from the Briko community.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/gallery' }
  ]
})

// Data types from gallery view
interface GalleryRow { id: string; public_id: string; name: string; kind: string; thumb_url?: string | null; likes: number; created_at: string; updated_at: string }

const { $supabase } = useNuxtApp() as any

const sorts = ['Trending', 'New', 'Top'] as const
const kinds = ['all', 'mosaic', 'voxel', 'avatar'] as const

const sort = ref<typeof sorts[number]>('Trending')
const kind = ref<typeof kinds[number]>('all')
const items = ref<any[]>([])
const loading = ref(false)

// Gate seeds in production unless explicitly enabled
const rc = useRuntimeConfig()
const showSeeds = process.dev || (((rc as any)?.public?.showSeeds || '') === 'true')

// Likes map for current user
const likedByMeMap = ref<Record<string, boolean>>({})
const savedByMeMap = ref<Record<string, boolean>>({})

// Tags
const selectedTags = ref<TagItem[]>([])
const tagSuggestions = ref<TagItem[]>([])
const projectTagsMap = ref<Record<string, TagItem[]>>({}) // project_id -> tags

function setSort(s: typeof sorts[number]){ sort.value = s }
function setKind(k: typeof kinds[number]){ kind.value = k }

// Seed fallback (shown only when there are no live projects)
type Seed = typeof seedsRaw[number]
const seedsEnhanced = computed(() => {
  return (seedsRaw as Seed[]).map((s, i) => ({
    id: `seed-${i + 1}`,
    public_id: undefined,
    name: s.title,
    kind: s.kind,
    thumb_url: s.preview,
    likes: s.likes,
    created_at: s.date,
    updated_at: s.date,
    username: s.username,
    bricks: s.bricks,
    cost: s.cost,
    saves: s.saves,
    date: s.date,
    tags: s.tags || [],
    isSeed: true
  }))
})

const isEmptyLive = computed(() => items.value.length === 0)

const baseList = computed(() => (isEmptyLive.value && showSeeds ? (seedsEnhanced.value as any[]) : (items.value as any[])))

const withTrending = computed(() => baseList.value.map((it: any) => {
  const d = it.created_at || it.date || new Date().toISOString()
  const hoursOld = (Date.now() - new Date(d).getTime()) / 36e5
  const trending = (it.likes || 0) * 3 + Math.max(0, 48 - hoursOld)
  return { ...it, trending }
}))

const filteredByKind = computed(() => kind.value === 'all' ? withTrending.value : withTrending.value.filter(i => i.kind === kind.value))

const filteredByTags = computed(() => {
  if (selectedTags.value.length === 0) return filteredByKind.value
  const req = new Set(selectedTags.value.map(t => (t.slug || t.name).toLowerCase()))
  return filteredByKind.value.filter((i: any) => {
    const realTags = projectTagsMap.value[i.id] || []
    const seedTags = (i.tags || []).map((n: string) => ({ name: n }))
    const mix = (isEmptyLive.value ? seedTags : realTags)
    const have = new Set(mix.map((t: any) => (t.slug || t.name).toLowerCase()))
    for (const s of req) if (!have.has(s)) return false
    return true
  })
})

const visibleItems = computed(() => {
  const list = [...filteredByTags.value]
  if (sort.value === 'New') list.sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  else if (sort.value === 'Top') list.sort((a:any,b:any)=> ((b.likes||0) + (b.saves||0)*0.5) - ((a.likes||0) + (a.saves||0)*0.5))
  else list.sort((a:any,b:any)=> (b as any).trending - (a as any).trending)
  return list
})

onMounted(async () => {
  await fetchGallery()
})

async function fetchGallery(){
  const { queryPublicProjects, buildPreviewUrl } = useProjects()
  loading.value = true
  try {
    const rows = await queryPublicProjects(sort.value)
    // Normalize rows to the grid item shape with thumb_url and social fields
    const v = (r:any) => {
      const d = r.updated_at || r.created_at
      try { return new Date(d).getTime() } catch { return Date.now() }
    }
    const bust = (url?: string, vv?: number) => url ? `${url}?v=${vv ?? Date.now()}` : ''

    const enforcePublic = (r: any) => ((typeof r.status !== 'undefined' || typeof r.is_public !== 'undefined')
      ? (r.status === 'public' || r.is_public === true)
      : true)

    const mapped = (rows || []).filter(enforcePublic).map((r: any) => {
      // build public URLs from storage paths
      const prev = buildPreviewUrl(r.preview_path)
      // fall back to original_path or derive alongside preview.png
      const derivedOriginal =
        typeof r.preview_path === 'string'
          ? r.preview_path.replace(/\/preview\.png$/i, '/original.png')
          : null
      const orig = r.original_path || r.original_preview_path || derivedOriginal

      return {
        id: r.id,
        public_id: r.id,
        name: r.title,
        kind: r.kind,
        thumb_url: bust(prev, v(r)),
        orig_url: orig ? bust(buildPreviewUrl(orig), v(r)) : null,
        likes: r.likes ?? 0,
        saves: r.saves ?? 0,
        username: (r.handle ? ('@' + r.handle) : (r.display_name || '@user')),
        bricks: r.bricks ?? 0,
        cost: r.cost_est ?? 0,
        tags: Array.isArray(r.tags) ? r.tags : [],
        created_at: r.created_at,
        updated_at: r.updated_at,
      }
    })
    items.value = mapped.filter((it: any) => !!it.thumb_url)
    await Promise.all([
      fetchReactionsByMe(),
      fetchProjectTags(),
    ])
  } catch (error) {
    console.error(error)
    try { useToasts().show('Failed to load gallery', 'error') } catch {}
  } finally {
    loading.value = false
  }
}

async function fetchReactionsByMe(){
  if(!$supabase) return
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ likedByMeMap.value = {}; savedByMeMap.value = {}; return }
  const ids = items.value.map(i => i.id)
  if(ids.length === 0) return
  const { getReactionsByMe } = useProjects()
  const { likes, saves } = await getReactionsByMe(ids, u.id)
  likedByMeMap.value = likes
  savedByMeMap.value = saves
}

async function fetchProjectTags(){
  if(!$supabase) return
  const ids = items.value.map(i => i.id)
  if(ids.length === 0) return
  // Join tags for the listed projects
  const { data, error } = await $supabase.from('project_tags').select('project_id, tags:tag_id ( id, name, slug )').in('project_id', ids)
  if(error){ console.warn(error); return }
  const map: Record<string, TagItem[]> = {}
  for(const row of (data||[])){
    const pid = (row as any).project_id as string
    const t = (row as any).tags as any
    if(!map[pid]) map[pid] = []
    if(t) map[pid].push({ id: t.id, name: t.name, slug: t.slug })
  }
  projectTagsMap.value = map
}

function shareItem(it: any){
  if(!it?.public_id){ try{ useToasts().show('Samples cannot be shared', 'info') }catch{}; return }
  const url = `${location.origin}/community/${it.public_id}`
  navigator.clipboard.writeText(url).then(()=>{ try{ useToasts().show('Link copied', 'success') }catch{} })
}

async function likeItem(it: any){
  if(it?.isSeed){ return }
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  likedByMeMap.value = { ...likedByMeMap.value, [it.id]: true }
  it.likes++
  try{ const { upsertReaction } = useProjects(); await upsertReaction(it.id, u.id, 'like') }catch(e:any){ console.warn(e) }
}

async function unlikeItem(it: any){
  if(it?.isSeed){ return }
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  likedByMeMap.value = { ...likedByMeMap.value, [it.id]: false }
  it.likes = Math.max(0, (it.likes||0) - 1)
  try{ const { deleteReaction } = useProjects(); await deleteReaction(it.id, u.id, 'like') }catch(e:any){ console.warn(e) }
}

async function saveItem(it: any){
  if(it?.isSeed){ return }
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  savedByMeMap.value = { ...savedByMeMap.value, [it.id]: true }
  it.saves = (it.saves || 0) + 1
  try{ const { upsertReaction } = useProjects(); await upsertReaction(it.id, u.id, 'save') }catch(e:any){ console.warn(e) }
}

async function unsaveItem(it: any){
  if(it?.isSeed){ return }
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  savedByMeMap.value = { ...savedByMeMap.value, [it.id]: false }
  it.saves = Math.max(0, (it.saves||0) - 1)
  try{ const { deleteReaction } = useProjects(); await deleteReaction(it.id, u.id, 'save') }catch(e:any){ console.warn(e) }
}

async function remixItem(_it: any){
  // For now, just open the mosaic builder ready to upload an image
  location.href = '/mosaic'
}

function slugify(name: string){ return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,32) }

async function searchTags(q: string){
  if(!$supabase) return
  if(!q){ tagSuggestions.value = []; return }
  const { data, error } = await $supabase.from('tags').select('*').ilike('name', `%${q}%`).limit(10)
  if(error){ console.warn(error); return }
  tagSuggestions.value = (data || [])
}

async function createTag(name: string){
  if(!$supabase) return
  const slug = slugify(name)
  const { data, error } = await $supabase.from('tags').insert({ name, slug }).select().single()
  if(error){ console.warn(error); return }
  selectedTags.value = [...selectedTags.value, { id: data.id, name: data.name, slug: data.slug }]
}

function addTag(tag: TagItem){
  if(!selectedTags.value.some(t => (t.id||t.slug) === (tag.id||tag.slug))){
    selectedTags.value = [...selectedTags.value, tag]
  }
}

function removeTag(tag: TagItem){
  selectedTags.value = selectedTags.value.filter(t => (t.id||t.slug) !== (tag.id||tag.slug))
}
</script>
