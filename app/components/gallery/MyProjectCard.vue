<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'
import { deleteProject } from '@/lib/gallery'

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

const isOwner = computed(() => userId.value === props.p.user_id)
const previewUrl = ref<string | null>(null)
const busyToggle = ref(false)
const isPublic = ref<boolean>(!!props.p.is_public)
const isRemixing = ref(false)

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
  await router.push({ path: '/photo', query: { remix: props.p.id } })
}

async function onRemix() {
  if (isRemixing.value) return
  isRemixing.value = true
  try {
    const { data: newId, error } = await $supabase.rpc('remix_project', { src: props.p.id })
    if (error || !newId) {
      console.error('remix error', error)
      return
    }
    await router.push(`/studio/${newId}?tab=mosaic`)
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
    class="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/10 backdrop-blur-sm transition hover:bg-white/7"
  >
    <!-- Thumb -->
    <NuxtLink :to="{ path: '/photo', query: { remix: p.id } }" class="block">
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

      <div class="mt-3 flex items-center gap-2">
        <NuxtLink
          :to="{ path: '/photo', query: { remix: p.id } }"
          class="h-9 rounded-xl px-3 ring-1 ring-black/10 bg-white/50 hover:bg-white/70 text-[var(--briko-ink-900)] transition"
        >
          View
        </NuxtLink>
        <button
          type="button"
          class="h-9 rounded-xl px-3 ring-1 ring-black/10 bg-white/10 hover:bg-white/20 text-[var(--briko-ink-900)] transition"
          :disabled="isRemixing"
          @click.stop.prevent="onRemix"
        >
          {{ isOwner ? 'Duplicate' : 'Remix' }}
        </button>

        <button
          v-if="isOwner"
          type="button"
          @click="onDelete"
          class="ml-auto h-9 rounded-xl px-3 ring-1 ring-red-500/30 text-red-600/90 bg-red-50/60 hover:bg-red-50"
          title="Delete"
        >
          Delete
        </button>
      </div>
    </div>
  </article>
</template>
