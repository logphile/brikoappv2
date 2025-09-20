<template>
  <main class="mx-auto max-w-xl px-6 py-10 text-white">
    <h1 class="text-2xl font-semibold">Profile</h1>
    <p class="opacity-80 text-sm mb-6">Update how your name appears publicly.</p>

    <div v-if="loading" class="opacity-70">Loading…</div>

    <form v-else class="grid gap-4 max-w-md" @submit.prevent="save">
      <label class="block text-sm">
        <span class="opacity-80">Handle</span>
        <input v-model.trim="handle" type="text" class="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2" placeholder="yourname" minlength="2" maxlength="32" />
        <span class="text-[12px] opacity-70">Shown as @handle. Only letters, numbers, dashes and underscores recommended.</span>
      </label>

      <label class="block text-sm">
        <span class="opacity-80">Display name</span>
        <input v-model.trim="displayName" type="text" class="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2" placeholder="Your Name" maxlength="64" />
      </label>

      <div class="flex items-center gap-2 pt-2">
        <button class="btn-mint" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
        <NuxtLink to="/projects" class="btn-outline-mint">Cancel</NuxtLink>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp, navigateTo } from 'nuxt/app'
import { useProfile } from '@/composables/useProfile'
import { useToasts } from '@/composables/useToasts'

const { $supabase } = useNuxtApp() as any
const { updateProfile } = useProfile()

const loading = ref(true)
const saving = ref(false)
const handle = ref<string>('')
const displayName = ref<string>('')

onMounted(async () => {
  if(!$supabase){ loading.value = false; return }
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ return navigateTo('/login') }

  try {
    const { data, error } = await $supabase
      .from('profiles')
      .select('handle, display_name')
      .eq('user_id', u.id)
      .maybeSingle()
    if(error) throw error
    handle.value = (data?.handle || '') as string
    displayName.value = (data?.display_name || '') as string
  } catch (e:any) {
    console.warn(e)
  } finally {
    loading.value = false
  }
})

async function save(){
  if(!$supabase) return
  saving.value = true
  try {
    const payload: any = { handle: handle.value || null, display_name: displayName.value || null }
    await updateProfile(payload)
    // Nice-to-have: mirror to auth metadata for instant header/menu display
    try { await $supabase.auth.updateUser({ data: { handle: payload.handle, display_name: payload.display_name } }) } catch {}
    try { useToasts().show('Profile updated', 'success') } catch {}
    navigateTo('/projects')
  } catch (e:any) {
    console.warn(e)
    try { useToasts().show(e?.message || 'Failed to save profile', 'error') } catch {}
  } finally {
    saving.value = false
  }
}
</script>
