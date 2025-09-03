<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Community Gallery</h1>
        <p class="opacity-80 text-sm">Public remixes and builds shared by the community.</p>
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
        <GalleryGrid :items="visibleItems" :liked-by-me-map="likedByMeMap" @like="likeItem" @unlike="unlikeItem" @remix="remixItem" @share="shareItem" />
        <div v-if="visibleItems.length === 0" class="opacity-70 mt-6">No results.</div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { useAuth } from '@/composables/useAuth'
import { useToasts } from '@/composables/useToasts'
import GalleryGrid from '@/components/gallery/GalleryGrid.vue'
import TagPicker, { type TagItem } from '@/components/tags/TagPicker.vue'

// Data types from gallery view
interface GalleryRow { id: string; public_id: string; name: string; kind: string; thumb_url?: string | null; likes: number; created_at: string; updated_at: string }

const { $supabase } = useNuxtApp() as any
const { user, loading: authLoading } = useAuth()

const sorts = ['Trending', 'New', 'Top'] as const
const kinds = ['all', 'mosaic', 'voxel', 'avatar'] as const

const sort = ref<typeof sorts[number]>('Trending')
const kind = ref<typeof kinds[number]>('all')
const items = ref<GalleryRow[]>([])
const loading = ref(false)

// Likes map for current user
const likedByMeMap = ref<Record<string, boolean>>({})

// Tags
const selectedTags = ref<TagItem[]>([])
const tagSuggestions = ref<TagItem[]>([])
const projectTagsMap = ref<Record<string, TagItem[]>>({}) // project_id -> tags

function setSort(s: typeof sorts[number]){ sort.value = s }
function setKind(k: typeof kinds[number]){ kind.value = k }

const withTrending = computed(() => items.value.map(it => {
  const hoursOld = (Date.now() - new Date(it.created_at).getTime()) / 36e5
  const trending = it.likes * 3 + Math.max(0, 48 - hoursOld)
  return { ...it, trending }
}))

const filteredByKind = computed(() => kind.value === 'all' ? withTrending.value : withTrending.value.filter(i => i.kind === kind.value))

const filteredByTags = computed(() => {
  if (selectedTags.value.length === 0) return filteredByKind.value
  const req = new Set(selectedTags.value.map(t => (t.slug || t.name).toLowerCase()))
  return filteredByKind.value.filter(i => {
    const tags = projectTagsMap.value[i.id] || []
    const have = new Set(tags.map(t => (t.slug || t.name).toLowerCase()))
    for (const s of req) if (!have.has(s)) return false
    return true
  })
})

const visibleItems = computed(() => {
  const list = [...filteredByTags.value]
  if (sort.value === 'New') list.sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  else if (sort.value === 'Top') list.sort((a,b)=> (b.likes||0) - (a.likes||0))
  else list.sort((a,b)=> (b as any).trending - (a as any).trending)
  return list
})

onMounted(async () => {
  await fetchGallery()
})

async function fetchGallery(){
  if(!$supabase) return
  loading.value = true
  const { data, error } = await $supabase.from('gallery').select('*').order('updated_at', { ascending: false })
  loading.value = false
  if(error){ console.error(error); try{ useToasts().show('Failed to load gallery', 'error') }catch{}; return }
  items.value = (data || []) as GalleryRow[]
  await Promise.all([
    fetchLikedByMe(),
    fetchProjectTags()
  ])
}

async function fetchLikedByMe(){
  if(!$supabase) return
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ likedByMeMap.value = {}; return }
  const ids = items.value.map(i => i.id)
  if(ids.length === 0) return
  const { data, error } = await $supabase.from('likes').select('project_id').in('project_id', ids).eq('user_id', u.id)
  if(error){ console.warn(error); return }
  const map: Record<string, boolean> = {}
  for(const r of (data||[])) map[(r as any).project_id] = true
  likedByMeMap.value = map
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

function shareItem(it: GalleryRow){
  const url = `${location.origin}/share/${it.public_id}`
  navigator.clipboard.writeText(url).then(()=>{ try{ useToasts().show('Link copied', 'success') }catch{} })
}

async function likeItem(it: GalleryRow){
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  likedByMeMap.value = { ...likedByMeMap.value, [it.id]: true }
  it.likes++
  try{
    const { error } = await $supabase.from('likes').insert({ project_id: it.id, user_id: u.id })
    if(error) throw error
  }catch(e:any){ console.warn(e) }
}

async function unlikeItem(it: GalleryRow){
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  likedByMeMap.value = { ...likedByMeMap.value, [it.id]: false }
  it.likes = Math.max(0, (it.likes||0) - 1)
  try{
    const { error } = await $supabase.from('likes').delete().eq('project_id', it.id).eq('user_id', u.id)
    if(error) throw error
  }catch(e:any){ console.warn(e) }
}

async function remixItem(it: GalleryRow){
  if(!$supabase){ return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  try{
    const { data: parent, error: pErr } = await $supabase.from('projects').select('*').eq('public_id', it.public_id).single()
    if(pErr) throw pErr
    const child = {
      user_id: u.id,
      name: `Remix of ${parent?.name ?? 'Project'}`,
      is_public: false,
      data: { ...(parent?.data || {}), parent_id: parent?.id, parent_public_id: parent?.public_id }
    }
    const { data: inserted, error: iErr } = await $supabase.from('projects').insert(child).select().single()
    if(iErr) throw iErr
    try{ useToasts().show('Remixed! Opening Projects…', 'success') }catch{}
    window.setTimeout(()=>{ location.href = '/projects' }, 300)
  }catch(e:any){ console.error(e); try{ useToasts().show('Remix failed', 'error') }catch{} }
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
