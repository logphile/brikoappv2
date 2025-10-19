<template>
  <!-- Default (Gallery) style: full-card link -->
  <NuxtLink v-if="!overlay" :to="`/p/${project.id}`"
    class="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-elevated">
    <div class="framed-img aspect-[4/3] bg-black/30">
      <NuxtImg v-if="project.cover_url"
           :src="project.cover_url as string" alt=""
           width="320" height="240" format="webp" densities="1x 2x"
           sizes="(max-width: 640px) 100vw, 320px"
           loading="lazy" fetchpriority="low"
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
  <article v-else class="gallery-card card group relative overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-card transition will-change-transform hover:-translate-y-0.5 hover:shadow-elevated">
    <!-- cover -->
    <div class="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
      <div class="absolute inset-0 animate-pulse bg-black/5" v-if="!imgLoaded" />
      <NuxtImg v-if="project.cover_url"
           :src="project.cover_url as string" :alt="project.title || 'Project preview'"
           width="320" height="320" format="webp" densities="1x 2x"
           sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
           loading="lazy" fetchpriority="low"
           class="h-full w-full object-cover"
           @load="onImgLoad" @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-black/60 text-sm">No preview</div>

      <!-- hover action cluster -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end p-3 bg-black/0 group-hover:bg-black/25">
          <div class="actions w-full flex gap-2">
            <NuxtLink
              :to="`${viewPrefix}/${project.id}`"
              class="inline-flex items-center justify-center h-9 px-3 rounded-full
                     leading-none text-sm font-medium bg-white text-gray-900/90
                     ring-1 ring-black/10 shadow-sm hover:bg-white/90 hover:shadow-md transition"
            >
              View
            </NuxtLink>
            <button
              class="inline-flex items-center justify-center h-9 px-3 rounded-full
                     leading-none text-sm font-medium text-white
                     bg-[#2F3061] hover:bg-[#2F3061]/90
                     ring-1 ring-black/0 shadow-sm transition"
              @click.stop="onRemix(project.id)"
              :disabled="isRemixing"
            >
              Remix
            </button>
            <button
              v-if="canDelete"
              class="inline-flex items-center justify-center h-9 px-3 rounded-full
                     leading-none text-sm font-medium text-white bg-[#FF0062]
                     ring-1 ring-black/0 shadow-sm hover:bg-[#ff1c73] transition"
              @click.stop="askDelete = true"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- caption -->
    <div class="mt-2 card-caption-ink p-3">
      <h3 class="card-title-ink text-[13px] line-clamp-1">{{ project.title || 'Untitled' }}</h3>
      <div class="mt-1">
        <span class="card-date-ink text-[13px]">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
  </article>
  <ConfirmModal
    v-if="canDelete"
    :open="askDelete"
    title="Delete project?"
    :message="`“${project.title || 'Untitled'}” will be permanently removed.`"
    confirm-label="Delete"
    cancel-label="Cancel"
    danger
    @close="askDelete = false"
    @confirm="doDelete"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useToasts } from '@/composables/useToasts'
// Nuxt auto-imported composables from @nuxtjs/supabase
declare const useSupabaseClient: <T = any>() => T
declare const useSupabaseUser: <T = any>() => T
const isRemixing = ref(false)
const askDelete = ref(false)
const deleting = ref(false)
const supabase = useSupabaseClient<any>()
const user = useSupabaseUser<any>()
const { show: showToast } = useToasts()
const emit = defineEmits<{ (e: 'img-error', id: string | number): void; (e: 'deleted', id: string | number): void }>()
interface OwnerInfo { handle?: string | null; display_name?: string | null }
interface CommunityProject {
  id: string | number
  title?: string | null
  cover_url?: string | null
  created_at: string
  owner?: OwnerInfo
}

const props = withDefaults(defineProps<{ project: CommunityProject; overlay?: boolean; viewPrefix?: string; canDelete?: boolean }>(), {
  overlay: false,
  viewPrefix: '/project',
})

const imgLoaded = ref(false)
function onImgLoad(){ imgLoaded.value = true }

// Remix: navigate to editor with source id as a query param (no insert)
async function onRemix(id: string | number){
  const src = String(id)
  if (!src) return
  await navigateTo({ path: '/mosaic', query: { remix: src } })
}

async function doDelete(){
  if (deleting.value) return
  deleting.value = true
  try {
    const me = user?.value?.id || ''
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', String(props.project.id))
      .eq('user_id', me)
    if (error) throw error
    emit('deleted', props.project.id)
    showToast('Project removed.', 'success')
  } catch (e: any) {
    showToast('Could not delete project.', 'error')
  } finally {
    deleting.value = false
    askDelete.value = false
  }
}
</script>
