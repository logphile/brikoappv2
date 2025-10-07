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
  // Same destination for now; separate flow can be added later
  await router.push({ path: '/photo', query: { remix: props.p.id } })
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
  <article class="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
    <div class="aspect-[4/3] bg-black/20 grid place-items-center">
      <img v-if="previewUrl" :src="previewUrl" alt="" class="w-full h-full object-cover" loading="lazy" />
      <div v-else class="text-sm opacity-60">No preview</div>
    </div>

    <div class="p-3 flex items-start justify-between gap-2">
      <div class="font-medium truncate">{{ p.name || 'Untitled' }}</div>
      <div class="flex items-center gap-2">
        <div class="text-xs opacity-70">{{ new Date(p.created_at).toLocaleDateString() }}</div>
        <!-- Private/Public pill -->
        <button
          class="px-3 py-1 rounded-full text-xs font-medium border transition disabled:opacity-60"
          :class="isPublic ? 'bg-green-500/15 border-green-400 text-green-200' : 'bg-white/10 border-white/20 text-white/70'"
          :disabled="busyToggle"
          @click="togglePublic"
          :aria-pressed="isPublic"
        >
          {{ isPublic ? 'Public' : 'Private' }}
        </button>
      </div>
    </div>

    <div class="px-3 pb-3 flex items-center gap-2">
      <button type="button" @click="onView"
        class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-white/90 text-black hover:bg-white cursor-pointer">
        <span class="material-symbols-rounded text-base">visibility</span>
        View
      </button>

      <button type="button" @click="onRemix"
        class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-white/90 text-black hover:bg-white cursor-pointer">
        <span class="material-symbols-rounded text-base">auto_fix_high</span>
        Remix
      </button>

      <button v-if="isOwner" type="button" @click="onDelete" title="Delete"
        class="ml-auto inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-white/20 hover:bg-white/10 cursor-pointer">
        <span class="material-symbols-rounded text-base">delete</span>
      </button>
    </div>
  </article>
</template>
