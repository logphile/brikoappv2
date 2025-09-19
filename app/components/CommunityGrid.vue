<template>
  <section class="mt-16">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-white">{{ copy.studio.communitySectionTitle }}</h2>
        <p class="mt-1 text-white/70">{{ copy.studio.communitySubhead }}</p>
      </div>
      <NuxtLink to="/gallery" class="text-sm text-mint hover:underline underline-offset-4 decoration-2">
        {{ copy.studio.seeAll }} →
      </NuxtLink>
    </header>

    <div v-if="loading && items.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div v-for="n in pageSize" :key="n" class="rounded-2xl h-40 bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <ProjectCard v-for="p in items" :key="p.id" :project="p" />
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <NuxtLink to="/gallery" class="btn-outline-mint">{{ copy.studio.seeAll }}</NuxtLink>
      <button v-if="hasMore" @click="loadMore" class="btn-mint">{{ copy.studio.loadMore }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import ProjectCard from '@/components/ProjectCard.vue'
import { copy } from '@/lib/copy'
import { useProjects } from '@/composables/useProjects'

const { $supabase } = useNuxtApp() as any
const { buildPreviewUrl } = useProjects()

const pageSize = 15 // 3 rows of 5 on xl
const items = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
let page = 0


async function fetchPage() {
  if (!$supabase) { hasMore.value = false; return }
  loading.value = true
  const from = page * pageSize
  const to = from + pageSize - 1

  // Pull straight from the public view the gallery uses
  const { data, error } = await $supabase
    .from('user_projects_public')
    .select('id, title, kind, preview_path, created_at, updated_at, likes, saves, username')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!error) {
    const list = (data || []) as any[]
    for (const p of list) {
      items.value.push({
        id: p.id,
        title: p.title,
        created_at: p.created_at,
        cover_url: p.preview_path ? buildPreviewUrl(p.preview_path) : null,
        owner: { username: (p as any).username || null },
      })
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
