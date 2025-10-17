<template>
  <!-- Default (Gallery) style: full-card link -->
  <NuxtLink v-if="!overlay" :to="`/p/${project.id}`"
    class="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-sm transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_18px_50px_-16px_rgba(0,229,160,.45)]">
    <div class="framed-img aspect-[4/3] bg-black/30">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" alt=""
           loading="lazy" decoding="async" fetchpriority="low"
           class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
    </div>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-white/90 truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="text-xs text-white/50">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
      <p v-if="project.owner && (project.owner.handle || project.owner.display_name)" class="mt-1 text-xs text-white/60 truncate">
        by {{ project.owner.handle ? ('@' + project.owner.handle) : (project.owner.display_name || '@user') }}
      </p>
    </div>
  </NuxtLink>

  <!-- Studio overlay style: soft card with square preview and hover actions -->
  <article v-else class="card card-hover group relative overflow-hidden">
    <!-- cover -->
    <div class="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
      <div class="absolute inset-0 animate-pulse bg-black/5" v-if="!imgLoaded" />
      <img v-if="project.cover_url"
           :src="project.cover_url as string" :alt="project.title || 'Project preview'"
           loading="lazy" decoding="async" fetchpriority="low"
           sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
           class="h-full w-full object-cover"
           @load="onImgLoad" @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-black/60 text-sm">No preview</div>

      <!-- hover action cluster -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition pointer-events-auto">
          <NuxtLink :to="`${viewPrefix}/${project.id}`" class="btn ring-1 ring-black/10 bg-white/50 hover:bg-white/70 text-[var(--briko-ink-900)] transition">View</NuxtLink>
          <button @click.stop.prevent="onRemix(project.id)" :disabled="isRemixing" class="btn ring-1 ring-black/10 bg-white/10 hover:bg-white/20 text-[var(--briko-ink-900)] transition">Remix</button>
        </div>
      </div>
    </div>
    <!-- caption -->
    <div class="mt-2 card-caption-ink p-3">
      <h3 class="card-title-ink text-base line-clamp-1">{{ project.title || 'Untitled' }}</h3>
      <div class="mt-1">
        <span class="card-date-ink">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from 'nuxt/app'
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T
const supabase = useSupabaseClient() as any
const isRemixing = ref(false)
const emit = defineEmits<{ (e: 'img-error', id: string | number): void }>()
interface OwnerInfo { handle?: string | null; display_name?: string | null }
interface CommunityProject {
  id: string | number
  title?: string | null
  cover_url?: string | null
  created_at: string
  owner?: OwnerInfo
}

const props = withDefaults(defineProps<{ project: CommunityProject; overlay?: boolean; viewPrefix?: string }>(), {
  overlay: false,
  viewPrefix: '/project',
})

const imgLoaded = ref(false)
function onImgLoad(){ imgLoaded.value = true }

// Fork via RPC and route to Studio Mosaic
async function onRemix(id: string | number){
  if (isRemixing.value) return
  isRemixing.value = true
  try {
    const src = String(id)
    const { data: newId, error } = await supabase.rpc('remix_project', { src })
    if (error || !newId) {
      // eslint-disable-next-line no-console
      console.error('remix error', error)
      return
    }
    await navigateTo(`/studio/${newId}?tab=mosaic`)
  } finally {
    isRemixing.value = false
  }
}
</script>
