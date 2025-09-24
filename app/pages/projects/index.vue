<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">{{ copy.studio.title }}</h1>
        <div class="mt-2 h-1 w-16 rounded-full bg-pink-500/80"></div>
        <p class="opacity-80 text-sm mt-2">{{ copy.studio.subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <ButtonOutline as="NuxtLink" to="/studio/community" :aria-label="copy.studio.communityButtonAria">
          {{ copy.studio.communityButton }}
        </ButtonOutline>
        <ButtonPrimary as="NuxtLink" to="/projects/new">New Project</ButtonPrimary>
      </div>
    </div>

    <div v-if="!user" class="mt-6 text-sm">
      Please <NuxtLink to="/login" class="underline">login</NuxtLink> to manage projects, or explore the <NuxtLink to="/community-studio" class="underline">Community Studio</NuxtLink>.
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
          <span v-if="p.is_public" class="px-2 py-1 rounded bg-mint/15 text-mint">Public</span>
          <span v-else class="px-2 py-1 rounded bg-white/10">Private</span>
        </div>
      </article>
    </section>

    <!-- Community Projects grid -->
    <CommunityGrid />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'
import { copy } from '@/lib/copy'
import CommunityGrid from '@/components/CommunityGrid.vue'
import ButtonPrimary from '@/components/ui/ButtonPrimary.vue'
import ButtonOutline from '@/components/ui/ButtonOutline.vue'

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
