<template>
  <section class="mt-16">
    <header class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-white">Community Projects</h2>
      <NuxtLink to="/studio/community" class="text-sm text-mint hover:underline underline-offset-4 decoration-2">
        See all →
      </NuxtLink>
    </header>

    <div v-if="loading && items.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div v-for="n in pageSize" :key="n" class="rounded-2xl h-40 bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <ProjectCard v-for="p in items" :key="p.id" :project="p" />
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <NuxtLink to="/studio/community" class="btn-outline-mint">See All</NuxtLink>
      <button v-if="hasMore" @click="loadMore" class="btn-mint">Load More</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import ProjectCard from '@/components/ProjectCard.vue'

const { $supabase } = useNuxtApp() as any

const pageSize = 15 // 3 rows of 5 on xl
const items = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
let page = 0

async function fetchCoversFor(projectIds: string[]) {
  try {
    if (!$supabase || projectIds.length === 0) return {}
    const { data, error } = await $supabase
      .from('assets')
      .select('project_id, kind, storage_path, created_at')
      .in('project_id', projectIds)
      .in('kind', ['preview_png', 'avatar_png'])
      .order('created_at', { ascending: false })

    if (error) { console.warn('[community-grid] assets error', error); return {} }

    // Pick most recent per project and build public URL
    const byProj: Record<string, string> = {}
    for (const a of data as any[]) {
      if (!byProj[a.project_id]) {
        const pub = $supabase.storage.from('public').getPublicUrl(a.storage_path)
        byProj[a.project_id] = pub?.data?.publicUrl || ''
      }
    }
    return byProj
  } catch (e) {
    console.warn(e); return {}
  }
}

async function fetchPage() {
  if (!$supabase) { hasMore.value = false; return }
  loading.value = true
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await $supabase
    .from('projects')
    .select('id,title,created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!error) {
    const list = (data || []) as any[]
    const coverMap = await fetchCoversFor(list.map(p => p.id))
    for (const p of list) {
      const cover = (coverMap as any)[p.id]
      items.value.push({ ...p, cover_url: cover || null })
    }
    if (list.length < pageSize) hasMore.value = false
  } else {
    console.warn('[community-grid] projects error', error)
  }
  loading.value = false
}

function loadMore() { page++; fetchPage() }

onMounted(fetchPage)
</script>
