<template>
  <main class="mx-auto max-w-xl px-6 py-10 text-white">
    <h1 class="text-2xl font-semibold">Account</h1>
    <p class="opacity-80 text-sm mb-6">Manage your account.</p>

    <section class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 grid gap-3">
      <div>
        <div class="text-sm opacity-75">Email</div>
        <div class="mt-0.5">{{ email || '—' }}</div>
      </div>
      <div>
        <NuxtLink to="/settings/profile" class="btn-outline-mint">Edit profile</NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp, navigateTo } from 'nuxt/app'

const { $supabase } = useNuxtApp() as any
const email = ref<string>('')

onMounted(async () => {
  if(!$supabase) return
  const u = (await $supabase.auth.getUser()).data.user
  if(!u){ return navigateTo('/login') }
  email.value = u.email || ''
})
</script>
