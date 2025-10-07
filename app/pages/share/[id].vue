<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div v-if="loading" class="opacity-70">Loading…</div>
    <div v-else-if="error" class="text-red-300">{{ error }}</div>
    <template v-else>
      <header class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold">{{ project?.name || 'Shared Project' }}</h1>
          <p class="text-sm opacity-80">Public Share · {{ project?.updated_at ? new Date(project.updated_at).toLocaleString() : '' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button :aria-pressed="likedByMe" @click="toggleLike" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 text-sm inline-flex items-center gap-2">
            <span>👍</span>
            <span>{{ likes }}</span>
          </button>
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 text-sm" @click="remix">⟲ Remix</button>
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 text-sm" @click="copyLink">↗ Copy link</button>
        </div>
      </header>

      <section class="mt-6 grid gap-4">
        <figure class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-center min-h-64">
          <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="max-h-[60vh] rounded-xl" />
          <div v-else class="opacity-70">No preview available</div>
        </figure>

        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-medium">Tags</h2>
            <button v-if="isOwner" class="text-sm underline" @click="editingTags = !editingTags">{{ editingTags ? 'Done' : 'Edit tags' }}</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="t in tags" :key="t.id || t.slug || t.name" class="px-2 py-1 rounded-full bg-white/10 text-xs">#{{ t.name }}</span>
            <span v-if="tags.length===0" class="opacity-70 text-sm">No tags yet.</span>
          </div>
          <div v-if="isOwner && editingTags" class="mt-3">
            <TagPicker :model-value="tags" :suggestions="tagSuggestions" placeholder="Add a tag…" hint="Press Enter to create" @create="createTag" @select="attachTag" @remove="detachTag" @search="searchTags" />
          </div>
        </div>

        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <h2 class="font-medium mb-2">Report</h2>
          <div class="flex flex-col gap-2">
            <textarea v-model="reportText" rows="3" placeholder="Describe the issue (abuse, spam, etc.)" class="w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-white/30"></textarea>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 text-sm" @click="submitReport" :disabled="!reportText.trim()">Submit Report</button>
              <span class="text-xs opacity-70">Your report is private.</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useNuxtApp, useHead } from 'nuxt/app'
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T
import TagPicker, { type TagItem } from '@/components/tags/TagPicker.vue'
import { useToasts } from '@/composables/useToasts'

type ProjectRow = { id: string; public_id: string; user_id: string; name: string; data?: any; is_public: boolean; created_at: string; updated_at: string }

const route = useRoute()
const supabase = useSupabaseClient<any>()

const loading = ref(true)
const error = ref('')
const project = ref<ProjectRow | null>(null)
const previewUrl = ref('')
const likes = ref(0)
const likedByMe = ref(false)
const isOwner = ref(false)

const tags = ref<TagItem[]>([])
const editingTags = ref(false)
const tagSuggestions = ref<TagItem[]>([])
const reportText = ref('')

// SEO
const shareUrl = computed(() => `https://briko.app/share/${String(route.params.id || '')}`)
useHead(() => ({
  title: 'Briko — Shared Project',
  meta: [
    { name: 'description', content: 'View and remix community LEGO builds made with Briko.' },
    { property: 'og:title', content: 'Briko — Shared Project' },
    { property: 'og:description', content: 'View and remix community LEGO builds made with Briko.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: shareUrl.value },
    { property: 'og:image', content: previewUrl.value || 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Briko — Shared Project' },
    { name: 'twitter:description', content: 'View and remix community LEGO builds made with Briko.' },
    { name: 'twitter:image', content: previewUrl.value || 'https://briko.app/og-default.png' }
  ]
}))

onMounted(async () => {
  loading.value = true
  try{
    const pid = String(route.params.id || '')
    const { data: proj, error: pErr } = await supabase.from('projects').select('id, public_id, user_id, name, data, is_public, created_at, updated_at').eq('public_id', pid).single()
    if(pErr) throw pErr
    if(!proj || !proj.is_public){ throw new Error('Project not found or not public.') }
    project.value = proj as ProjectRow
    // Preview from data.preview.thumbUrl if present
    const thumb = (proj as any)?.data?.preview?.thumbUrl || (proj as any)?.data?.preview?.url || ''
    if(thumb) previewUrl.value = thumb
    await Promise.all([
      fetchLikes(),
      fetchTags(),
      resolveOwnership()
    ])
  }catch(e:any){ error.value = e?.message || 'Failed to load project.' }
  finally{ loading.value = false }
})

async function resolveOwnership(){
  const u = (await supabase.auth.getUser()).data.user
  isOwner.value = !!(u && project.value && u.id === project.value.user_id)
}

async function fetchLikes(){
  if(!project.value) return
  const p = project.value as ProjectRow
  const pid = p.id
  const countReq = supabase.from('likes').select('id', { count: 'exact', head: true }).eq('project_id', pid)
  const meReq = (async ()=>{ const u = (await supabase.auth.getUser()).data.user; if(!u) return { data: null } as any; return supabase.from('likes').select('*').eq('project_id', pid).eq('user_id', u.id).maybeSingle() })()
  const [{ count }, { data: me }] = await Promise.all([countReq, meReq])
  likes.value = count || 0
  likedByMe.value = !!me
}

async function toggleLike(){
  if(!project.value) return
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  if(likedByMe.value){
    likedByMe.value = false; likes.value = Math.max(0, likes.value - 1)
    await supabase.from('likes').delete().eq('project_id', project.value.id).eq('user_id', u.id)
  } else {
    likedByMe.value = true; likes.value = likes.value + 1
    await supabase.from('likes').insert({ project_id: project.value.id, user_id: u.id })
  }
}

async function remix(){
  if(!project.value) return
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  try{
    const { data: parent, error: pErr } = await supabase.from('projects').select('id, public_id, name, data').eq('public_id', project.value.public_id).single()
    if(pErr) throw pErr
    const child = {
      user_id: u.id,
      name: `Remix of ${parent?.name ?? 'Project'}`,
      is_public: false,
      data: { ...(parent?.data || {}), parent_id: parent?.id, parent_public_id: parent?.public_id }
    }
    const { error: iErr } = await supabase.from('projects').insert(child).select().single()
    if(iErr) throw iErr
    try{ useToasts().show('Remixed! Opening Projects…', 'success') }catch{}
    window.setTimeout(()=>{ location.href = '/projects' }, 300)
  }catch(e:any){ console.error(e); try{ useToasts().show('Remix failed', 'error') }catch{} }
}

function copyLink(){
  const url = location.href
  navigator.clipboard.writeText(url).then(()=>{ try{ useToasts().show('Link copied', 'success') }catch{} })
}

async function fetchTags(){
  if(!project.value) return
  const { data, error: err } = await supabase.from('project_tags').select('project_id, tags:tag_id ( id, name, slug )').eq('project_id', project.value.id)
  if(err){ console.warn(err); return }
  const list: TagItem[] = []
  for(const row of (data||[])){
    const t = (row as any).tags
    if(t) list.push({ id: t.id, name: t.name, slug: t.slug })
  }
  tags.value = list
}

async function searchTags(q: string){
  if(!q){ tagSuggestions.value = []; return }
  const { data } = await supabase.from('tags').select('*').ilike('name', `%${q}%`).limit(10)
  tagSuggestions.value = (data||[])
}

function slugify(name: string){ return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,32) }

async function createTag(name: string){
  const slug = slugify(name)
  const { data, error } = await supabase.from('tags').insert({ name, slug }).select().single()
  if(error){ console.warn(error); return }
  await attachTag({ id: data.id, name: data.name, slug: data.slug })
}

async function attachTag(tag: TagItem){
  if(!project.value) return
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  if(tags.value.some(t => (t.id||t.slug) === (tag.id||tag.slug))) return
  const { error } = await supabase.from('project_tags').insert({ project_id: project.value.id, tag_id: tag.id, user_id: u.id })
  if(error){ console.warn(error); return }
  tags.value = [...tags.value, tag]
}

async function detachTag(tag: TagItem){
  if(!project.value) return
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  const { error } = await supabase.from('project_tags').delete().eq('project_id', project.value.id).eq('tag_id', tag.id!)
  if(error){ console.warn(error); return }
  tags.value = tags.value.filter(t => (t.id||t.slug) !== (tag.id||tag.slug))
}

async function submitReport(){
  const text = reportText.value.trim()
  if(!text || !project.value) return
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  const { error } = await supabase.from('reports').insert({ project_id: project.value.id, user_id: u.id, reason: text })
  if(error){ console.warn(error); try{ useToasts().show('Report failed', 'error') }catch{}; return }
  reportText.value = ''
  try{ useToasts().show('Thanks — we\'ll review.', 'success') }catch{}
}
</script>
