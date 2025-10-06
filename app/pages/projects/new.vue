<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-bold">New Project</h1>
      <p class="mt-2 text-[color:var(--dark)/.7]">Create a fresh build.</p>

      <form class="card-ivory mt-6 p-6 sm:p-8 rounded-2xl space-y-6" @submit.prevent="create">
        <!-- Title -->
        <div>
          <label for="title" class="block font-semibold">Title</label>
          <input id="title" v-model="title" autocomplete="off"
                 class="mt-2 w-full h-11 rounded-xl bg-[var(--ivory)]
                        border border-[color:var(--ivory-border)]
                        text-[var(--dark)] placeholder-[color:var(--dark)/.5]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--purple)]"
                 placeholder="My Mosaic" />
        </div>

        <!-- Dimensions -->
        <div>
          <div class="flex items-center justify-between">
            <span class="block font-semibold">Dimensions</span>
            <span class="text-sm text-[color:var(--dark)/.6]">Range 16–512</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label for="w" class="sr-only">Width</label>
              <input id="w" type="number" v-model.number="width" min="16" max="512" step="1"
                     class="w-full h-11 rounded-xl bg-[var(--ivory)]
                            border border-[color:var(--ivory-border)]
                            text-[var(--dark)] placeholder-[color:var(--dark)/.5]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--purple)]"
                     placeholder="128" />
            </div>
            <div>
              <label for="h" class="sr-only">Height</label>
              <input id="h" type="number" v-model.number="height" min="16" max="512" step="1"
                     class="w-full h-11 rounded-xl bg-[var(--ivory)]
                            border border-[color:var(--ivory-border)]
                            text-[var(--dark)] placeholder-[color:var(--dark)/.5]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--purple)]"
                     placeholder="128" />
            </div>
          </div>
          <p v-if="error" class="mt-2 text-sm" style="color:#FF0062">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button type="submit" class="btn-pink focus-cyber" :disabled="loading">Create</button>
          <NuxtLink to="/studio" class="btn-purple-outline focus-cyber">Cancel</NuxtLink>
        </div>
      </form>
    </div>
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
    user_id: user.id,
    title: title.value,
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
