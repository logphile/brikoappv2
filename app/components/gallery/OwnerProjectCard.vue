<template>
  <article class="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-sm">
    <div class="aspect-[4/3] bg-black/5 flex items-center justify-center">
      <img
        v-if="url"
        :src="url"
        alt=""
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="text-sm opacity-60">No preview</div>
    </div>

    <div class="p-3 flex items-center justify-between">
      <div class="font-medium truncate">{{ p.name || 'Untitled' }}</div>
      <div class="text-xs opacity-70">{{ dateLocal }}</div>
    </div>

    <div class="px-3 pb-3 flex items-center gap-2">
      <button type="button" @click="onView" class="px-3 py-1.5 text-sm rounded-md bg-white/90 text-black hover:bg-white cursor-pointer">
        View
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-sm rounded-md bg-white/90 text-black hover:bg-white cursor-pointer"
        :disabled="isRemixing"
        @click.stop.prevent="onRemix"
      >
        {{ isOwner ? 'Duplicate' : 'Remix' }}
      </button>

      <button
        v-if="isOwner"
        type="button"
        @click="onDelete"
        title="Delete project"
        aria-label="Delete project"
        class="ml-auto px-2 py-1.5 rounded-md border border-white/20 hover:bg-white/10 cursor-pointer"
      >
        🗑️
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'
import { deleteProject } from '@/lib/gallery'

const props = defineProps<{ p: any }>()
const url = ref<string | null>(null)
const isRemixing = ref(false)
const userId = ref<string | null>(null)
const router = useRouter()
const { $supabase } = useNuxtApp() as any

onMounted(async () => {
  // resolve current user id for owner checks
  try {
    const u = await $supabase?.auth?.getUser?.()
    userId.value = u?.data?.user?.id || null
  } catch {}
  // priority: thumbnail → mosaic → original
  url.value =
    (await signedUrl(props.p.thumbnail_path)) ||
    (await signedUrl(props.p.mosaic_path)) ||
    (await signedUrl(props.p.original_path)) ||
    null
})

const dateLocal = computed(() => {
  try { return new Date(props.p?.created_at).toLocaleDateString() } catch { return '' }
})

const isOwner = computed(() => {
  const owner = props.p?.user_id || props.p?.owner
  return owner ? owner === userId.value : true
})

async function onView(){
  await router.push(`/studio/${props.p.id}`)
}
async function onRemix(){
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
async function onDelete(){
  if (!isOwner.value) return
  const ok = window.confirm('Delete this project permanently? This cannot be undone.')
  if (!ok) return
  try {
    await deleteProject(props.p)
    // notify parent lists to refresh if listening
    window.dispatchEvent(new CustomEvent('project:deleted', { detail: props.p.id }))
  } catch (e:any) {
    console.error('Delete failed', e?.message || e)
    alert('Could not delete this project.')
  }
}
</script>
