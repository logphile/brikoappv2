<template>
  <main class="mx-auto max-w-md px-6 py-10 text-white">
    <h1 class="text-2xl font-semibold">New Project</h1>
    <form class="mt-6 space-y-4" @submit.prevent="create">
      <label class="block text-sm">
        <span>Title</span>
        <input v-model="title" required class="mt-1 w-full rounded-xl bg-white/10 px-3 py-2" placeholder="My Mosaic" />
      </label>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <label>Width<input type="number" v-model.number="width" min="8" max="256" class="mt-1 w-full rounded-xl bg-white/10 px-3 py-2"/></label>
        <label>Height<input type="number" v-model.number="height" min="8" max="256" class="mt-1 w-full rounded-xl bg-white/10 px-3 py-2"/></label>
      </div>
      <button class="w-full py-2 rounded-xl bg-cta-grad disabled:opacity-50" :disabled="loading">{{ loading ? 'Creating…' : 'Create' }}</button>
    </form>
    <p v-if="error" class="mt-3 text-sm text-red-300">{{ error }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'
import { useMosaicStore } from '@/stores/mosaic'

const { $supabase } = useNuxtApp() as any
const router = useRouter()
const mosaic = useMosaicStore()

const title = ref('My Mosaic')
const width = ref(mosaic.settings.width || 128)
const height = ref(mosaic.settings.height || 128)
const loading = ref(false)
const error = ref('')

function slugify(s: string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,64) || 'untitled' }
function rand(n=6){ return Math.random().toString(36).slice(2,2+n) }

async function create(){
  error.value = ''
  if(!$supabase){ error.value = 'Supabase unavailable'; return }
  loading.value = true
  const { data: { user } } = await $supabase.auth.getUser()
  if(!user){ error.value = 'Login required'; loading.value=false; return }
  const payload = {
    owner: user.id,
    title: title.value,
    slug: `${slugify(title.value)}-${rand(4)}`,
    width: width.value,
    height: height.value,
    is_public: false
  }
  const { data, error: err } = await $supabase.from('projects').insert(payload).select('id').single()
  loading.value = false
  if(err){ error.value = err.message; return }
  const id = data.id as string
  mosaic.setCurrentProject(id)
  router.push(`/projects/${id}`)
}
</script>
