<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ project?.name || 'Project' }}</h1>
        <div v-if="project" class="text-sm opacity-80">{{ project.width }}×{{ project.height }} studs</div>
      </div>
      <NuxtLink to="/mosaic" class="px-4 py-2 rounded-xl bg-cta-grad">Open Editor</NuxtLink>
    </div>

    <section class="mt-6 grid gap-4">
      <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
        <h2 class="font-medium mb-2">Sharing</h2>
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="projectPublic" @change="togglePublic" />
            <span>Public (read‑only)</span>
          </label>
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" @click="copyLink" :disabled="!shareUrl">Copy Share Link</button>
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" @click="regenerate" :disabled="!projectPublic">Regenerate Link</button>
          <NuxtLink v-if="shareUrl" :to="sharePath" class="underline">Open public view</NuxtLink>
        </div>
        <p v-if="err" class="mt-2 text-sm text-red-300">{{ err }}</p>
      </div>

      <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
        <h2 class="font-medium mb-2">Assets</h2>
        <div class="flex items-center gap-3 text-sm">
          <button class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40" @click="uploadPreview">Upload Preview</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useNuxtApp, navigateTo } from 'nuxt/app'
import { useMosaicStore } from '@/stores/mosaic'
import { useToasts } from '@/composables/useToasts'

const route = useRoute()
const { $supabase } = useNuxtApp() as any
const mosaic = useMosaicStore()

const pid = String(route.params.id || '')
await navigateTo(`/studio/${pid}`)
const project = ref<any | null>(null)
const projectPublic = ref(false)
const err = ref('')

const sharePath = computed(()=> project.value?.share_token ? `/s/${project.value.share_token}` : '')
const shareUrl = computed(()=> sharePath.value ? (location.origin + sharePath.value) : '')

function rand(n=8){ return Math.random().toString(36).slice(2, 2+n) }

async function fetchProject(){
  if(!$supabase) return
  const { data, error } = await $supabase.from('projects').select('id, name, width, height, is_public, share_token, created_at, updated_at').eq('id', pid).single()
  if(error){ err.value = error.message; try{ useToasts().show('Failed to load project', 'error') }catch{}; return }
  project.value = data
  projectPublic.value = !!data.is_public
}

async function togglePublic(){
  err.value = ''
  if(!project.value) return
  const updates: any = { is_public: projectPublic.value }
  if (projectPublic.value && !project.value.share_token) updates.share_token = rand(12)
  const { data, error } = await $supabase.from('projects').update(updates).eq('id', pid).select('id, is_public, share_token, updated_at').single()
  if(error){ err.value = error.message; try{ useToasts().show('Failed to update sharing', 'error') }catch{}; return }
  project.value = data
  try{ useToasts().show(projectPublic.value ? 'Project is public' : 'Project is private', 'success') }catch{}
}

async function regenerate(){
  if(!project.value) return
  const { data, error } = await $supabase.from('projects').update({ share_token: rand(12) }).eq('id', pid).select('id, share_token, updated_at').single()
  if(error){ err.value = error.message; try{ useToasts().show('Failed to regenerate link', 'error') }catch{}; return }
  project.value = data
  try{ useToasts().show('Share link regenerated', 'success') }catch{}
}

async function copyLink(){
  if(!shareUrl.value) return
  try{ await navigator.clipboard.writeText(shareUrl.value); try{ useToasts().show('Link copied', 'success') }catch{} }
  catch(e){ console.warn(e); try{ useToasts().show('Copy failed', 'error') }catch{} }
}

async function uploadPreview(){
  await mosaic.uploadPreview()
}

onMounted(async () => {
  mosaic.setCurrentProject(pid)
  await fetchProject()
  await mosaic.loadProject(pid)
})
</script>
