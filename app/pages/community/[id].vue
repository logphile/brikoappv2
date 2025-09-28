<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useHead, useNuxtApp } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'
import { useToasts } from '@/composables/useToasts'

const route = useRoute()
const { $supabase } = useNuxtApp() as any
const { buildPreviewUrl, upsertReaction, deleteReaction } = useProjects()

const project = ref<any | null>(null)
const loading = ref(false)
const error = ref('')

const previewUrl = computed(() => {
  if (!project.value?.preview_path) return ''
  const ver = (() => {
    const d = project.value?.updated_at || project.value?.created_at
    try { return new Date(d).getTime() } catch { return Date.now() }
  })()
  return `${buildPreviewUrl(project.value.preview_path)}?v=${ver}`
})
const likes = ref(0)
const saves = ref(0)
const likedByMe = ref(false)
const savedByMe = ref(false)

// SEO
useHead({
  title: computed(()=> project.value?.title ? `${project.value.title} — Community` : 'Community Project'),
  meta: [
    { name: 'description', content: 'Community project on Briko.' },
    { property: 'og:title', content: computed(()=> project.value?.title || 'Community Project') as any },
    { property: 'og:description', content: 'Community project on Briko.' },
    { property: 'og:image', content: computed(()=> previewUrl.value || 'https://briko.app/og-default.png') as any },
  ]
})

function rel(input?: string){
  if(!input) return ''
  const d = new Date(input)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  const r = (n:number,u:string)=>`${n} ${u}${n!==1?'s':''} ago`
  if(s < 60) return r(s,'second')
  const m = Math.floor(s/60); if(m<60) return r(m,'minute')
  const h = Math.floor(m/60); if(h<24) return r(h,'hour')
  const dys = Math.floor(h/24); if(dys<30) return r(dys,'day')
  const mo = Math.floor(dys/30); if(mo<12) return r(mo,'month')
  const y = Math.floor(mo/12); return r(y,'year')
}

async function fetchDetail(){
  error.value = ''
  const id = String(route.params.id || '')
  try {
    loading.value = true
    const { data, error: err } = await $supabase.from('user_projects_public').select('*').eq('id', id).maybeSingle()
    if (err) throw err
    project.value = data
    likes.value = data?.likes ?? 0
    saves.value = data?.saves ?? 0
    // reactions by current user
    const u = (await $supabase.auth.getUser()).data.user
    if (u) {
      const { data: reacts } = await $supabase.from('reactions').select('*').eq('project_id', id).eq('user_id', u.id)
      likedByMe.value = !!reacts?.find((r:any)=> r.rtype==='like')
      savedByMe.value = !!reacts?.find((r:any)=> r.rtype==='save')
    }
  } catch (e:any) {
    console.error(e); error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function share(){
  const url = location.href
  navigator.clipboard?.writeText(url).then(()=>{ try{ useToasts().show('Link copied', 'success') }catch{} })
}

async function like(){
  const id = String(route.params.id || '')
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  if(likedByMe.value){ await deleteReaction(id, u.id, 'like'); likes.value = Math.max(0, likes.value - 1) }
  else { await upsertReaction(id, u.id, 'like'); likes.value = likes.value + 1 }
  likedByMe.value = !likedByMe.value
}
async function save(){
  const id = String(route.params.id || '')
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ location.href = '/login'; return }
  if(savedByMe.value){ await deleteReaction(id, u.id, 'save'); saves.value = Math.max(0, saves.value - 1) }
  else { await upsertReaction(id, u.id, 'save'); saves.value = saves.value + 1 }
  savedByMe.value = !savedByMe.value
}
function remix(){ location.href = '/mosaic' }

onMounted(fetchDetail)
</script>

<template>
  <main class="mx-auto max-w-4xl px-6 py-10 text-white">
    <div v-if="loading" class="opacity-70">Loading…</div>
    <div v-else-if="error" class="text-red-300">{{ error }}</div>
    <div v-else-if="project" class="grid gap-4">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">{{ project.title }}</h1>
          <p class="text-sm text-white/70">by {{ project.handle ? ('@' + project.handle) : (project.display_name || '@user') }} · {{ rel(project.created_at) }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" @click="share">Share</button>
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" @click="remix">Remix</button>
        </div>
      </header>

      <section class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <img v-if="previewUrl" :src="previewUrl" :alt="project.title" class="w-full object-contain" />
        <div v-else class="p-6 text-white/70">No preview available</div>
      </section>

      <section class="grid sm:grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-between">
          <span>Bricks</span>
          <strong>{{ (project.bricks ?? 0).toLocaleString() }}</strong>
        </div>
        <div class="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-between">
          <span>Estimated cost</span>
          <strong>${{ (project.cost_est ?? 0).toLocaleString() }}</strong>
        </div>
      </section>

      <section class="flex items-center gap-3 text-sm">
        <button :aria-pressed="likedByMe" @click="like" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 inline-flex items-center gap-1">
          <span>❤️</span> <span>{{ likes }}</span>
        </button>
        <button :aria-pressed="savedByMe" @click="save" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 inline-flex items-center gap-1">
          <span>📌</span> <span>{{ saves }}</span>
        </button>
        <div class="ml-auto flex gap-2">
          <button class="btn-ivory-outline focus-cyber px-3 py-1.5 rounded-xl" @click="share">Copy link</button>
          <button class="btn-pink focus-cyber px-3 py-1.5 rounded-xl" @click="remix">Remix</button>
        </div>
      </section>

      <section v-if="Array.isArray(project.tags) && project.tags.length" class="flex flex-wrap gap-2">
        <span v-for="t in project.tags" :key="t" class="chip-mint">#{{ t }}</span>
      </section>
    </div>
  </main>
</template>
