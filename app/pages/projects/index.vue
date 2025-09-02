<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Your Projects</h1>
        <p class="opacity-80 text-sm">Private by default. Make them public to share.</p>
      </div>
      <NuxtLink to="/projects/new" class="px-4 py-2 rounded-xl bg-cta-grad">New Project</NuxtLink>
    </div>

    <div v-if="!user" class="mt-6 text-sm">
      Please <NuxtLink to="/login" class="underline">login</NuxtLink> to manage projects.
    </div>

    <section v-else class="mt-6 grid gap-4">
      <div v-if="loading" class="opacity-70">Loading…</div>
      <div v-else-if="projects.length===0" class="opacity-70">No projects yet.</div>
      <article v-for="p in projects" :key="p.id" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center gap-4">
        <div class="grow">
          <NuxtLink :to="`/projects/${p.id}`" class="font-medium hover:underline">{{ p.title }}</NuxtLink>
          <div class="text-xs opacity-75">{{ p.width }}×{{ p.height }} studs · Updated {{ new Date(p.updated_at).toLocaleString() }}</div>
        </div>
        <div class="text-xs">
          <span v-if="p.is_public" class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-200">Public</span>
          <span v-else class="px-2 py-1 rounded bg-white/10">Private</span>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'

const { $supabase } = useNuxtApp() as any
const router = useRouter()
const user = ref<any>(null)
const projects = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  if(!$supabase) return
  const u = await $supabase.auth.getUser(); user.value = u.data.user
  if(!user.value) return
  loading.value = true
  const { data, error } = await $supabase.from('projects').select('*').order('updated_at', { ascending: false })
  loading.value = false
  if(error) console.error(error)
  projects.value = data || []
})
</script>
