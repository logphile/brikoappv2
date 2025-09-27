<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">

      <!-- Header -->
      <header class="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold">Your Projects</h1>
          <p class="mt-2 text-[color:var(--dark)/.7]">Private by default. Make them public to share.</p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink to="/studio" class="btn-purple-outline focus-cyber">Community Studio</NuxtLink>
          <NuxtLink to="/studio/new" class="btn-pink focus-cyber">New Project</NuxtLink>
        </div>
      </header>

      <!-- Login prompt -->
      <div v-if="!user" class="mb-10 text-sm">
        Please <NuxtLink to="/login" class="underline">login</NuxtLink> to manage projects, or explore the <NuxtLink to="/studio" class="underline">Community Studio</NuxtLink>.
      </div>

      <!-- Your Projects -->
      <section v-else class="mb-10">
        <SectionHeader title="Your Projects" />

        <div v-if="loading" class="text-[color:var(--dark)/.7]">Loading…</div>
        <template v-else>
          <ProjectGrid v-if="myProjects.length" :items="myProjects" view-prefix="/projects" />
          <div v-else class="card-ivory p-6 rounded-2xl text-center">
            <p class="text-[color:var(--dark)/.7]">No projects yet.</p>
            <NuxtLink to="/studio/new" class="btn-pink mt-4 focus-cyber">Create your first project</NuxtLink>
          </div>
        </template>
      </section>

      <!-- Community Projects (See All on right) -->
      <section class="mb-6">
        <div class="flex items-end justify-between">
          <div>
            <SectionHeader title="Community Projects" />
            <p class="text-[color:var(--dark)/.7] -mt-2 mb-3">Fresh builds from creators like you.</p>
          </div>
          <NuxtLink to="/gallery" class="btn-purple-outline focus-cyber h-9 px-3 text-sm">See All</NuxtLink>
        </div>

        <div v-if="loadingCommunity" class="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in 10" :key="`sk-${n}`" class="aspect-square rounded-2xl bg-white/70 animate-pulse"></div>
        </div>
        <ProjectGrid v-else :items="community" view-prefix="/community" />
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import SectionHeader from '@/components/SectionHeader.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import { useProjects } from '@/composables/useProjects'

const { $supabase } = useNuxtApp() as any
const { buildPreviewUrl } = useProjects()

const user = ref<any>(null)
const loading = ref(false)
const myProjects = ref<any[]>([])

const loadingCommunity = ref(false)
const community = ref<any[]>([])

onMounted(async () => {
  if(!$supabase) return

  // Auth
  const u = await $supabase.auth.getUser(); user.value = u.data.user

  // Fetch user's projects
  if(user.value){
    loading.value = true
    const { data, error } = await $supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    loading.value = false
    if(error) console.error(error)
    const list = (data || []) as any[]
    // Map into ProjectCard shape
    myProjects.value = list.map(p => ({
      id: p.id,
      title: p.title || 'Untitled',
      created_at: p.updated_at || p.created_at,
      cover_url: p.preview_path ? `${buildPreviewUrl(p.preview_path)}?v=${Date.now()}` : null,
    }))
  }

  // Fetch a page of community projects
  loadingCommunity.value = true
  {
    const from = 0, to = 14
    const { data, error } = await $supabase
      .from('user_projects_public')
      .select('id, title, preview_path, created_at, updated_at, handle, display_name')
      .order('created_at', { ascending: false })
      .range(from, to)
    if(!error){
      const list = (data || []) as any[]
      for(const p of list){
        const v = (()=>{ try { return new Date(p.updated_at || p.created_at).getTime() } catch { return Date.now() } })()
        community.value.push({
          id: p.id,
          title: p.title || 'Untitled',
          created_at: p.created_at,
          cover_url: p.preview_path ? `${buildPreviewUrl(p.preview_path)}?v=${v}` : null,
          owner: { handle: (p as any).handle || null, display_name: (p as any).display_name || null },
        })
      }
    } else {
      console.warn('[your-projects] community fetch error', error)
    }
  }
  loadingCommunity.value = false
})
</script>
