<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'
import { deleteProject } from '@/lib/gallery'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useToasts } from '@/composables/useToasts'

type Row = {
  id: string
  user_id: string
  name: string | null
  created_at: string
  thumbnail_path?: string | null
  mosaic_path?: string | null
  original_path?: string | null
  is_public: boolean
}

const props = defineProps<{ p: Row }>()
const router = useRouter()
const { $supabase } = useNuxtApp() as any
const userId = ref<string | null>(null)
// Nuxt auto-imports (@nuxtjs/supabase)
declare const useSupabaseUser: <T = any>() => { value: any }

const ownerId = computed(() => (props.p as any)?.owner_id ?? (props.p as any)?.user_id ?? (props.p as any)?.created_by ?? null)
const isOwner = computed(() => {
  const u = useSupabaseUser().value?.id
  const o = ownerId.value
  return !!(u && o && u === o)
})
const previewUrl = ref<string | null>(null)
const busyToggle = ref(false)
const isPublic = ref<boolean>(!!props.p.is_public)
const isRemixing = ref(false)
const { show: showToast } = useToasts()
const askDelete = ref(false)
const deleting = ref(false)

onMounted(async () => {
  try {
    const u = await $supabase?.auth?.getUser?.()
    userId.value = u?.data?.user?.id || null
  } catch {}
  previewUrl.value =
    (await signedUrl(props.p.thumbnail_path)) ||
    (await signedUrl(props.p.mosaic_path)) ||
    (await signedUrl(props.p.original_path)) ||
    null
})

// keep in sync when parent updates prop
watch(() => props.p.is_public, (v) => { isPublic.value = !!v })

async function onView() {
  // Open the Mosaic editor pre-loaded with this project
  await router.push({ path: '/mosaic', query: { remix: props.p.id } })
}

async function onRemix() {
  if (isRemixing.value) return
  isRemixing.value = true
  try {
    await router.push({ path: '/mosaic', query: { remix: props.p.id } })
  } finally {
    isRemixing.value = false
  }
}

async function onDelete() {
  if (!isOwner.value) return
  if (!confirm('Delete this project permanently?')) return
  try {
    await deleteProject(props.p)
    window.dispatchEvent(new CustomEvent('project:deleted', { detail: props.p.id }))
  } catch (e: any) {
    console.error('Delete failed', e?.message || e)
    alert('Could not delete this project.')
  }
}

async function doDelete() {
  if (!isOwner.value || deleting.value) return
  deleting.value = true
  try {
    await deleteProject(props.p)
    window.dispatchEvent(new CustomEvent('project:deleted', { detail: props.p.id }))
    showToast('Project removed.', 'success')
  } catch (e:any) {
    console.error('Delete failed', e?.message || e)
    showToast('Could not delete this project.', 'error')
  } finally {
    deleting.value = false
    askDelete.value = false
  }
}

async function togglePublic(){
  if (busyToggle.value) return
  busyToggle.value = true
  const next = !isPublic.value
  try {
    const { error } = await $supabase
      .from('projects')
      .update({ is_public: next })
      .eq('id', props.p.id)
    if (error) throw error
    isPublic.value = next
  } catch (e:any) {
    console.error('[togglePublic] failed', e)
    alert('Could not update visibility')
  } finally {
    busyToggle.value = false
  }
}
</script>

<template>
  <article
    class="gallery-card group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/10 backdrop-blur-sm transition hover:bg-white/7"
    :data-live-card="'gallery'"
    :data-owner-id="(p as any).owner_id || (p as any).user_id || (p as any).created_by || null"
    :data-user="userId"
    :data-is-owner="isOwner"
  >
    <!-- Thumb -->
    <NuxtLink :to="{ path: '/mosaic', query: { remix: p.id } }" class="block">
      <div class="aspect-[16/10] overflow-hidden bg-black/10">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt=""
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="h-full w-full grid place-items-center text-sm opacity-60">No preview</div>
      </div>
    </NuxtLink>

    <!-- Meta / actions -->
    <div class="p-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="truncate font-medium text-[var(--briko-ink-900)]">
          {{ p.name || 'Untitled' }}
        </h3>
        <button
          class="pill"
          :class="isPublic ? 'pill--public' : 'pill--private'"
          :disabled="busyToggle"
          @click="togglePublic"
          :aria-pressed="isPublic"
        >
          {{ isPublic ? 'Public' : 'Private' }}
        </button>
      </div>

      <div class="mt-1 text-xs opacity-60 flex items-center gap-3">
        <time :datetime="p.created_at">{{ new Date(p.created_at).toLocaleDateString() }}</time>
      </div>

      <!-- Actions (client-only to avoid SSR race with user) -->
      <ClientOnly>
        <div class="actions mt-2 flex items-center gap-2">
          <!-- View -->
          <NuxtLink
            :to="{ path: '/mosaic', query: { remix: p.id } }"
            class="inline-flex items-center justify-center h-9 px-3 rounded-xl leading-none
                   ring-1 ring-black/10 bg-white/50 hover:bg-white/70 text-[var(--briko-ink-900)] transition"
          >
            View
          </NuxtLink>

          <!-- Remix -->
          <button
            type="button"
            class="inline-flex items-center justify-center h-9 px-3 rounded-xl leading-none
                   ring-1 ring-black/10 bg-white/10 hover:bg-white/20 text-[var(--briko-ink-900)] transition"
            :disabled="isRemixing"
            @click.stop.prevent="onRemix"
          >
            Remix
          </button>

          <!-- Delete -->
          <button
            v-if="isOwner"
            type="button"
            class="inline-flex items-center justify-center h-9 px-3 rounded-xl leading-none
                   text-sm font-medium text-white bg-[#FF0062]
                   ring-1 ring-black/0 shadow-sm hover:bg-[#ff1c73] transition"
            @click.stop="askDelete = true"
          >
            Delete
          </button>
        </div>

        <!-- Confirm modal -->
        <ConfirmModal
          v-if="isOwner"
          :open="askDelete"
          title="Delete project?"
          :message="`“${p.name || p.title || 'Untitled'}” will be permanently removed.`"
          confirm-label="Delete"
          cancel-label="Cancel"
          danger
          @close="askDelete = false"
          @confirm="doDelete"
        />
      </ClientOnly>
    </div>
  </article>
</template>
