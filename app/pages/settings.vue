<template>
  <div>
    <!-- Header with actions -->
    <header class="page-wrap mt-4 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-5xl lg:text-6xl font-slab">Profile</h1>
        <p class="mt-2 text-[#34343A]/70">Update how your name appears publicly.</p>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <NuxtLink to="/studio" class="btn-outline-ink">Briko Studio</NuxtLink>
        <button @click="onSave" class="btn-primary">Save</button>
      </div>
    </header>

    <!-- Content cards -->
    <main class="page-wrap mt-8 space-y-10">
      <!-- Identity -->
      <section class="card card-hover p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h">Identity</span>
          <div class="section-rule"></div>
        </div>

        <div class="form-grid">
          <div>
            <label class="label-briko" for="handle">Handle</label>
            <input id="handle" v-model="form.handle" :class="['input-briko mt-1', errors.handle && 'input-error']" placeholder="yourname" />
            <p class="help-briko">Shown as @handle. Letters, numbers, dashes, underscores.</p>
            <p v-if="errors.handle" class="msg-error">{{ errors.handle }}</p>
          </div>

          <div>
            <label class="label-briko" for="display">Display name</label>
            <input id="display" v-model="form.displayName" class="input-briko mt-1" placeholder="Your name" />
            <p class="help-briko">How your name appears across Briko.</p>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="card card-hover p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h">Contact</span>
          <div class="section-rule"></div>
        </div>

        <div class="form-grid">
          <div>
            <label class="label-briko" for="email">Email</label>
            <input id="email" :value="user?.email || ''" class="input-briko mt-1" disabled />
            <p class="help-briko">Email is managed by your account provider.</p>
          </div>

          <div>
            <label class="label-briko" for="visibility">Profile visibility</label>
            <select id="visibility" v-model="form.visibility" class="select-briko mt-1">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <p class="help-briko">Public profiles show your handle and projects.</p>
          </div>
        </div>
      </section>

      <!-- Danger zone -->
      <section class="card card-hover p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h">Danger zone</span>
          <div class="section-rule"></div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p class="font-medium">Delete account</p>
            <p class="help-briko">This permanently removes your profile and projects.</p>
          </div>
          <button @click="onDelete" class="btn-outline-ink">Delete</button>
        </div>
      </section>
    </main>

    <!-- Mobile sticky actions -->
    <div class="md:hidden fixed bottom-4 right-4 left-4 flex justify-end gap-2">
      <button @click="onCancel" class="btn-outline-ink">Cancel</button>
      <button @click="onSave" class="btn-primary">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useHead } from 'nuxt/app'

import { useBrikoSupabase } from '@/composables/useBrikoSupabase'

useHead({ title: 'Settings' })

const supabase = useBrikoSupabase()
const user = ref<{ id: string; email?: string; user_metadata?: Record<string, any> } | null>(null)

const form = reactive({
  handle: '',
  displayName: '',
  visibility: 'public'
})

const errors = reactive<{ handle?: string }>({})

onMounted(async () => {
  try {
    const { data } = await supabase.auth.getUser()
    user.value = data?.user || null
  } catch {}
  form.handle = (user.value?.user_metadata?.handle as string) || ''
  form.displayName = (user.value?.user_metadata?.displayName as string) || ''
})

function onCancel(){
  form.handle = (user.value?.user_metadata?.handle as string) || ''
  form.displayName = (user.value?.user_metadata?.displayName as string) || ''
}

async function onSave(){
  errors.handle = ''
  if (!/^[a-z0-9_-]{3,20}$/i.test(form.handle)) {
    errors.handle = 'Use 3–20 letters, numbers, dashes, or underscores.'
    return
  }
  // TODO: call your API to persist profile fields
  // await updateProfile(form)
  // show toast on success
}

async function onDelete(){
  // TODO: confirm and call delete API
}
</script>
