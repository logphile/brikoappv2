<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-bold">Profile</h1>
      <p class="mt-2 text-[color:var(--text-dim)]">Update how your name appears publicly.</p>

      <div v-if="loading" class="mt-6 text-[color:var(--text-dim)]">Loading…</div>

      <form v-else class="card-ivory mt-6 p-6 sm:p-8 rounded-2xl" @submit.prevent="save">
        <!-- Handle -->
        <label class="block font-semibold">Handle</label>
        <input
          v-model.trim="handle"
          type="text"
          class="mt-2 w-full h-11 rounded-xl bg-[var(--ivory)] border border-[color:var(--ivory-border)]
                 text-[var(--dark)] placeholder-[color:var(--text-dim)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--purple)]"
          placeholder="yourname" minlength="2" maxlength="32" />
        <p class="mt-2 text-sm text-[color:var(--text-dim)]">
          Shown as @handle. Only letters, numbers, dashes and underscores recommended.
        </p>

        <!-- Display name -->
        <label class="block font-semibold mt-6">Display name</label>
        <input
          v-model.trim="displayName"
          type="text"
          class="mt-2 w-full h-11 rounded-xl bg-[var(--ivory)] border border-[color:var(--ivory-border)]
                 text-[var(--dark)] placeholder-[color:var(--text-dim)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--purple)]"
          placeholder="Your Name" maxlength="64" />

        <!-- Actions -->
        <div class="mt-6 flex gap-3">
          <button type="submit" class="btn-pink focus-cyber" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
          <NuxtLink to="/studio" class="btn-purple-outline focus-cyber">Cancel</NuxtLink>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp, navigateTo } from 'nuxt/app'
import { useProfile } from '@/composables/useProfile'
import { useToasts } from '@/composables/useToasts'
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T

const supabase = useSupabaseClient<any>()
const { updateProfile } = useProfile()

const loading = ref(true)
const saving = ref(false)
const handle = ref<string>('')
const displayName = ref<string>('')

onMounted(async () => {
  if(!supabase){ loading.value = false; return }
  const u = (await supabase.auth.getUser()).data.user
  if(!u){ return navigateTo('/login') }

  try {
    const { data, error } = await supabase
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
  if(!supabase) return
  saving.value = true
  try {
    const payload: any = { handle: handle.value || null, display_name: displayName.value || null }
    await updateProfile(payload)
    // Nice-to-have: mirror to auth metadata for instant header/menu display
    try { await supabase.auth.updateUser({ data: { handle: payload.handle, display_name: payload.display_name } }) } catch {}
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
