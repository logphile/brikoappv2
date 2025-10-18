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
      <section class="rounded-2xl p-6 md:p-8 bg-[var(--briko-purple-900)] text-white ring-1 ring-white/10 shadow-xl shadow-black/20">
        <h3 class="text-sm tracking-wide uppercase opacity-90 mb-4">Identity</h3>

        <!-- 12-col grid: Handle (6) + Display name (6) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
          <!-- Handle -->
          <div class="md:col-span-6">
            <label for="handle" class="block text-sm mb-1.5 opacity-90">Handle</label>
            <input
              id="handle"
              v-model="form.handle"
              type="text"
              class="w-full h-11 rounded-xl px-4 ring-1 ring-white/10 bg-[var(--briko-purple-50)] text-[var(--briko-ink-900)] placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--briko-accent)]"
              placeholder="yourhandle"
            />
            <p class="mt-1 text-xs opacity-80">Shown on Community, Gallery, remixes, exports, and share links.</p>
            <p v-if="errors.handle" class="msg-error">{{ errors.handle }}</p>
            <p v-if="saved==='err' && serverError" class="msg-error">{{ serverError }}</p>
          </div>

          <!-- Display name -->
          <div class="md:col-span-6">
            <label for="displayName" class="block text-sm mb-1.5 opacity-90">Display name</label>
            <input
              id="displayName"
              v-model="form.display_name"
              type="text"
              class="w-full h-11 rounded-xl px-4 ring-1 ring-white/10 bg-[var(--briko-purple-50)] text-[var(--briko-ink-900)] placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--briko-accent)]"
              placeholder="Your name"
            />
            <p class="mt-1 text-xs opacity-80">How your name appears across Briko.</p>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="rounded-2xl p-6 md:p-8 bg-[var(--briko-purple-900)] text-white ring-1 ring-white/10 shadow-xl shadow-black/20">
        <h3 class="text-sm tracking-wide uppercase opacity-90 mb-4">Contact</h3>

        <!-- 12-col grid: Email (8) + Visibility (4) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
          <!-- Email -->
          <div class="md:col-span-8">
            <label for="email" class="block text-sm mb-1.5 opacity-90">Email</label>
            <input
              id="email"
              :value="user?.email || ''"
              type="email"
              class="w-full h-11 rounded-xl px-4 ring-1 ring-white/10 bg-[var(--briko-purple-50)] text-[var(--briko-ink-900)] placeholder-black/50 disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--briko-accent)]"
              disabled
            />
            <p class="mt-1 text-xs opacity-80">Email is managed by your account provider.</p>
          </div>

          <!-- Profile visibility -->
          <div class="md:col-span-4">
            <label for="profileVisibility" class="block text-sm mb-1.5 opacity-90">Profile visibility</label>
            <div class="relative">
              <select
                id="profileVisibility"
                v-model="form.profile_visibility"
                class="w-full h-11 rounded-xl pl-4 pr-10 ring-1 ring-white/10 bg-[var(--briko-purple-50)] text-[var(--briko-ink-900)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--briko-accent)]"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <!-- chevron -->
              <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70 text-[var(--briko-ink-900)]" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <p class="mt-1 text-xs opacity-80">Public profiles show your handle and projects.</p>
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
    <p v-if="saved==='err'" class="page-wrap mt-4 text-sm text-red-500">{{ serverError || 'Couldn’t save—try again.' }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect, computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useProfile } from '@/composables/useProfile'
declare const useSupabaseUser: <T = any>() => T

useHead({ title: 'Settings' })

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ requiresAuth: true, middleware: ['auth'] })

// Auth user for email display only
const user = useSupabaseUser<any>()

const { profile, loading, saveProfile, loadProfile, error: serverError } = useProfile()

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
