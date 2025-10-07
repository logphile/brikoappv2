<template>
  <section class="mt-16">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-[#343434]">{{ copy.studio.communitySectionTitle }}</h2>
        <div class="mt-1 h-1 w-10 rounded bg-pink-500/80"></div>
        <p class="mt-1 text-[#343434]">{{ copy.studio.communitySubhead }}</p>
      </div>
      <NuxtLink to="/gallery" class="inline-flex items-center gap-1.5 text-sm text-[#343434] rounded-md px-2 py-1 transition hover:bg-white/10">
        {{ copy.studio.seeAll }}
        <span class="material-symbols-rounded text-[18px] text-pink-500" aria-hidden="true">chevron_right</span>
      </NuxtLink>
    </header>

    <div v-if="loading && items.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div v-for="n in pageSize" :key="n" class="rounded-2xl h-40 bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <ProjectCard v-for="p in displayItems" :key="p.id" :project="p" @img-error="onCardImgError" />
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <NuxtLink to="/gallery" class="btn-purple-outline focus-cyber">{{ copy.studio.seeAll }}</NuxtLink>
      <button v-if="hasMore" @click="loadMore" class="btn-pink focus-cyber">{{ copy.studio.loadMore }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T
import ProjectCard from '@/components/ProjectCard.vue'
import { copy } from '@/lib/copy'
import { useProjects } from '@/composables/useProjects'

const supabase = useSupabaseClient<any>()
const { buildPreviewUrl } = useProjects()

const pageSize = 15 // 3 rows of 5 on xl
const items = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
let page = 0

// Drop tiles that fail to load their preview image
const broken = ref<Set<string>>(new Set())
function onCardImgError(id?: string | number){ if (id != null) broken.value.add(String(id)) }
const displayItems = computed(() => items.value.filter(i => !broken.value.has(String(i.id))))


async function fetchPage() {
  if (!supabase) { hasMore.value = false; return }
  loading.value = true
  const from = page * pageSize
  const to = from + pageSize - 1

  // Pull straight from the public view the gallery uses
  const { data, error } = await supabase
    .from('user_projects_public')
    .select('id, title, kind, preview_path, created_at, updated_at, likes, saves, handle, display_name')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!error) {
    const list = (data || []) as any[]
    for (const p of list) {
      const handle = (p as any).handle as string | undefined
      const display = (p as any).display_name as string | undefined
      const v = (() => { try { return new Date(p.updated_at || p.created_at).getTime() } catch { return Date.now() } })()
      items.value.push({
        id: p.id,
        title: p.title,
        created_at: p.created_at,
        cover_url: p.preview_path ? `${buildPreviewUrl(p.preview_path)}?v=${v}` : null,
        owner: { handle: handle || null, display_name: display || null },
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
