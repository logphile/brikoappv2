<template>
  <div>
    <!-- Header with actions -->
    <header class="page-wrap mt-4 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-5xl lg:text-6xl font-slab">Profile</h1>
        <p class="mt-2 text-[#34343A]/70">Update how your name appears publicly.</p>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <NuxtLink to="/studio" class="btn btn-secondary">Briko Studio</NuxtLink>
        <button @click="onSave" :disabled="saving" class="btn btn-primary">
          <span v-if="!saving">Save</span>
          <span v-else>Saving…</span>
        </button>
      </div>
    </header>

    <!-- Content cards -->
    <main class="page-wrap mt-8 space-y-10">
      <!-- Identity -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Identity</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="form-grid">
          <div>
            <label class="label-briko text-white" for="handle">Handle</label>
            <input id="handle" v-model="form.handle" :class="['input-briko', 'input-briko--ink', 'mt-1', errors.handle && 'input-error']" placeholder="yourname" />
            <p class="help-briko help-briko--ink">Shown as @handle. Letters, numbers, dashes, underscores.</p>
            <p v-if="errors.handle" class="msg-error">{{ errors.handle }}</p>
          </div>

          <div>
            <label class="label-briko text-white" for="display">Display name</label>
            <input id="display" v-model="form.display_name" class="input-briko input-briko--ink mt-1" placeholder="Your name" />
            <p class="help-briko help-briko--ink">How your name appears across Briko.</p>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Contact</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="form-grid">
          <div>
            <label class="label-briko text-white" for="email">Email</label>
            <input id="email" :value="user?.email || ''" class="input-briko input-briko--ink mt-1" disabled />
            <p class="help-briko help-briko--ink">Email is managed by your account provider.</p>
          </div>

          <div>
            <label class="label-briko text-white" for="visibility">Profile visibility</label>
            <select id="visibility" v-model="form.profile_visibility" class="select-briko select-briko--ink mt-1">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <p class="help-briko help-briko--ink">Public profiles show your handle and projects.</p>
          </div>
        </div>
      </section>

      <!-- Danger zone -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Danger zone</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p class="font-medium text-white">Delete account</p>
            <p class="help-briko help-briko--ink">This permanently removes your profile and projects.</p>
          </div>
          <button @click="onDelete" class="btn-pink-outline">Delete</button>
        </div>
      </section>
    </main>

    <!-- Mobile sticky actions -->
    <div class="md:hidden fixed bottom-4 right-4 left-4 flex justify-end gap-2">
      <button @click="onCancel" class="btn-outline-ink">Cancel</button>
      <button @click="onSave" :disabled="saving" class="btn btn-primary">Save</button>
    </div>

    <!-- Saved feedback -->
    <p v-if="saved==='ok'" class="page-wrap mt-4 text-sm text-[#343434]">Saved. Your header will update momentarily.</p>
    <p v-if="saved==='err'" class="page-wrap mt-4 text-sm text-red-500">Couldn’t save—try again.</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect, computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useProfile } from '@/composables/useProfile'
declare const useSupabaseUser: <T = any>() => T

useHead({ title: 'Settings' })

// Auth user for email display only
const user = useSupabaseUser<any>()

const { profile, loading, saveProfile, loadProfile } = useProfile()

const form = reactive({
  handle: '',
  display_name: '',
  profile_visibility: 'public' as 'public' | 'private'
})

const errors = reactive<{ handle?: string }>({})
const saving = ref(false)
const saved = ref<null | 'ok' | 'err'>(null)

watchEffect(() => {
  if (profile.value) {
    form.handle = profile.value.handle ?? ''
    form.display_name = profile.value.display_name ?? ''
    form.profile_visibility = (profile.value.profile_visibility as 'public' | 'private') ?? 'public'
  }
})

function onCancel(){
  if (profile.value) {
    form.handle = profile.value.handle ?? ''
    form.display_name = profile.value.display_name ?? ''
    form.profile_visibility = (profile.value.profile_visibility as 'public' | 'private') ?? 'public'
  }
}

async function onSave(){
  errors.handle = ''
  if (form.handle && !/^[a-z0-9_-]{3,20}$/i.test(form.handle)) {
    errors.handle = 'Use 3–20 letters, numbers, dashes, or underscores.'
    return
  }
  saving.value = true; saved.value = null
  const { err } = await saveProfile({
    handle: form.handle || null,
    display_name: form.display_name || null,
    profile_visibility: form.profile_visibility
  } as any)
  saved.value = err ? 'err' : 'ok'
  saving.value = false
  try { await loadProfile() } catch {}
}

async function onDelete(){
  // TODO: confirm and call delete API
}
</script>
