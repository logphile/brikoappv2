<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'
import { deleteProject } from '@/lib/gallery'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useToasts } from '@/composables/useToasts'
import UiButton from '@/components/ui/UiButton.vue'

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
    class="gallery-card group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/10 backdrop-blur-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-elevated hover:bg-white/7"
    :data-live-card="'gallery'"
    :data-owner-id="(p as any).owner_id || (p as any).user_id || (p as any).created_by || null"
    :data-user="userId"
    :data-is-owner="isOwner"
  >
    <!-- Media -->
    <NuxtLink :to="`/studio/${p.id}`" class="group block" aria-label="Open project">
      <div
        class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl
               ring-1 ring-black/10
               transition-all duration-200
               group-hover:-translate-y-0.5 group-hover:shadow-xl
               group-hover:ring-2 group-hover:ring-[#00E5A0] group-hover:shadow-[0_0_12px_#00E5A040]
               motion-reduce:transition-none motion-reduce:transform-none"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt=""
          class="block h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="h-full w-full grid place-items-center text-sm opacity-60">No preview</div>

        <!-- Optional stud overlay -->
        <div
          class="pointer-events-none absolute inset-0 opacity-0
                 group-hover:opacity-20 transition-opacity
                 bg-[url('/patterns/stud-pattern.svg')] bg-[length:28px_28px] mix-blend-overlay"
        ></div>

        <!-- Bottom vignette -->
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>
    </NuxtLink>

    <!-- Meta / actions -->
    <div class="p-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="truncate font-medium text-[var(--briko-ink-900)]">
          <span class="truncate">{{ p.name || 'Untitled' }}</span>
          <span v-if="(p as any)?.author?.handle || (p as any)?.profiles?.handle" class="ml-2 opacity-80 text-sm">
            · @{{ ((p as any)?.author?.handle || (p as any)?.profiles?.handle) }}
          </span>
        </h3>
        <button
          class="inline-flex items-center rounded-xl px-2 h-6 text-xs ring-1 transition"
          :class="isPublic ? 'bg-pink/10 text-pink ring-pink/40' : 'bg-ink/10 text-ink ring-ink/30'"
          :disabled="busyToggle"
          @click="togglePublic"
          :aria-pressed="isPublic"
        >
          {{ isPublic ? 'Public' : 'Private' }}
        </button>
      </div>

      <!-- Footer bar: name · @handle · date -->
      <div class="mt-2 flex items-center justify-between rounded-b-2xl bg-[#2B2E5B] px-4 py-3 text-[13px] font-semibold text-white">
        <div class="min-w-0 truncate">
          <span class="truncate">{{ p.name || 'Untitled' }}</span>
          <span v-if="(p as any)?.author?.handle || (p as any)?.profiles?.handle" class="ml-2 opacity-80">
            · @{{ ((p as any)?.author?.handle || (p as any)?.profiles?.handle) }}
          </span>
        </div>
        <time class="shrink-0 opacity-80">{{ new Date(p.created_at).toLocaleDateString() }}</time>
      </div>

      <!-- Actions (client-only to avoid SSR race with user) -->
      <ClientOnly>
        <div class="actions mt-3 flex items-center gap-2" @click.stop>
          <!-- View -->
          <NuxtLink
            :to="`/studio/${p.id}`"
            class="inline-flex h-9 items-center justify-center rounded-xl px-3 ring-1 ring-white/15 hover:bg-white/5 transition"
            aria-label="View"
          >View</NuxtLink>

          <!-- Remix -->
          <NuxtLink
            :to="`/photo?project=${p.id}`"
            class="inline-flex h-9 items-center justify-center rounded-xl px-3 bg-[#6D5BF5] text-white hover:brightness-110 transition"
            aria-label="Remix"
          >Remix</NuxtLink>

          <!-- Delete -->
          <button
            v-if="isOwner"
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-xl px-3 bg-[#FF0062] text-white hover:brightness-110 transition"
            @click.stop="askDelete = true"
          >Delete</button>
        </div>

        <!-- Confirm modal -->
        <ConfirmModal
          v-if="isOwner"
          :open="askDelete"
          title="Delete project?"
          :message="`“${p.name || 'Untitled'}” will be permanently removed.`"
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
