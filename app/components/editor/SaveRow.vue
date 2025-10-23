<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
// Nuxt auto-imported composables from @nuxtjs/supabase
declare const useSupabaseClient: <T = any>() => T
declare const useSupabaseUser: <T = any>() => T
import { useProjects } from '@/composables/useProjects'

// Minimal draft structure used by the editor
type ProjectDraft = {
  id?: string | null
  title?: string | null
  is_public: boolean
  thumbnail_path: string | null
  mosaic_path: string | null
  original_path: string | null
}

const props = defineProps<{
  draft: ProjectDraft
  dirty: boolean           // parent computes dirty state
  onAfterSave?: (id: string) => void
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const saving = ref(false)
const menuOpen = ref(false)
const savedAt = ref<string | null>(null)
const route = useRoute()
const remixSourceId = computed<string | null>(() => {
  try {
    const id = (route?.query as any)?.remix
    return typeof id === 'string' && id ? id : null
  } catch {
    return null
  }
})

async function save() {
  if (import.meta.server) return
  if (saving.value) return
  saving.value = true
  try {
    if (!user.value) { location.href = '/login'; return }

    const row = {
      id: props.draft.id ?? undefined,
      user_id: user.value.id,
      name: props.draft.title ?? null,
      thumbnail_path: props.draft.thumbnail_path,
      mosaic_path: props.draft.mosaic_path,
      original_path: props.draft.original_path,
      is_public: props.draft.is_public,
      source_project_id: remixSourceId.value ?? undefined
    }

    let data: any = null
    let error: any = null
    if (row.id) {
      ;({ data, error } = await supabase
        .from('projects')
        .upsert(row, { onConflict: 'id' })
        .select('id')
        .single())
      if (error && /source_project_id|column .*source_project_id.* does not exist/i.test(String(error.message || ''))) {
        const { source_project_id: _omit, ...row2 } = row as any
        ;({ data, error } = await supabase
          .from('projects')
          .upsert(row2, { onConflict: 'id' })
          .select('id')
          .single())
      }
    } else {
      ;({ data, error } = await supabase
        .from('projects')
        .insert(row)
        .select('id')
        .single())
      if (error && /source_project_id|column .*source_project_id.* does not exist/i.test(String(error.message || ''))) {
        const { source_project_id: _omit, ...row2 } = row as any
        ;({ data, error } = await supabase
          .from('projects')
          .insert(row2)
          .select('id')
          .single())
      }
    }

    if (error) throw error

    // fill id on first save
    if (!props.draft.id && data?.id) props.draft.id = data.id as string
    savedAt.value = new Date().toLocaleTimeString()
    props.onAfterSave?.(props.draft.id as string)

    // Best-effort: export PNG cover and set public cover_url on projects
    try {
      const cvs: HTMLCanvasElement | OffscreenCanvas | undefined = (window as any).__brikoCanvas
      if (cvs && user.value?.id && props.draft.id) {
        const { canvasToBlob } = useProjects()
        const blob = await canvasToBlob(cvs)
        const key = `${user.value.id}/${props.draft.id}/cover.png`
        const { error: upErr } = await supabase.storage
          .from('covers')
          .upload(key, blob, { contentType: 'image/png', upsert: true })
        if (!upErr) {
          const { data: pub } = supabase.storage.from('covers').getPublicUrl(key)
          const coverUrl = (pub as any)?.publicUrl || (pub as any)?.publicURL || (pub as any)?.public_url || null
          if (coverUrl) {
            try {
              await supabase
                .from('projects')
                .update({ cover_url: coverUrl })
                .eq('id', props.draft.id)
                .eq('user_id', user.value.id)
            } catch (e) {
              // fallback without eq user guard (older schemas)
              try { await supabase.from('projects').update({ cover_url: coverUrl }).eq('id', props.draft.id) } catch {}
            }
          }
        }
      }
    } catch (e) {
      console.warn('[SaveRow] cover upload failed', e)
    }
  } catch (e: any) {
    console.error(e); alert(e?.message ?? 'Save failed')
  } finally {
    saving.value = false
  }
}

const label = computed(() => {
  const isNew = !props.draft.id
  return props.draft.is_public && isNew ? 'Save & Publish' : 'Save'
})

defineExpose({ save })
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      class="px-4 py-2 rounded-xl bg-pink-500 text-black font-semibold hover:bg-pink-400
             disabled:opacity-60"
      :disabled="saving || !dirty"
      @click="save"
      type="button"
    >
      <span v-if="saving">Saving…</span>
      <span v-else>{{ label }}</span>
    </button>

    <!-- Saved tick -->
    <p v-if="savedAt" class="text-xs text-white/70">
      Saved {{ savedAt }}
    </p>

    <!-- More… (optional actions) -->
    <div class="relative ml-auto">
      <button class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
              type="button" @click="menuOpen = !menuOpen">
        More…
      </button>
      <div v-if="menuOpen"
           class="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#2F3061] text-sm shadow-xl z-50">
        <!-- Upload preview: dev-only; hide in prod if you want -->
        <button class="w-full text-left px-3 py-2 hover:bg-white/10">Upload Preview</button>
        <!-- Delete is best handled from My Gallery; keep optional here -->
        <button class="w-full text-left px-3 py-2 text-red-300 hover:bg-white/10">Delete</button>
      </div>
    </div>
  </div>
</template>
