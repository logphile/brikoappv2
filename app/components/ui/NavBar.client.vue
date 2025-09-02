<template>
  <header class="w-full bg-midnight/60 backdrop-blur sticky top-0 z-40">
    <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div aria-hidden="true" class="h-7 w-7 rounded-xl bg-cta-grad ring-1 ring-white/10"></div>
        <span class="text-lg font-semibold tracking-tight">Briko</span>
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm text-white/80">
        <NuxtLink to="/mosaic" class="hover:text-white">Mosaic</NuxtLink>
        <NuxtLink to="/avatar" class="hover:text-white">Avatar</NuxtLink>
        <NuxtLink to="/projects" class="hover:text-white">Projects</NuxtLink>
        <button v-if="!user" @click="goLogin" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Login</button>
        <div v-else class="flex items-center gap-3">
          <span class="hidden sm:inline">{{ user.email }}</span>
          <button @click="logout" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40">Logout</button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useNuxtApp } from 'nuxt/app'

const router = useRouter()
const { $supabase } = useNuxtApp() as any
const user = ref<any>(null)

async function refreshSession(){
  if(!$supabase) return
  const { data } = await $supabase.auth.getUser()
  user.value = data.user || null
}

function goLogin(){ router.push('/login') }
async function logout(){ await $supabase.auth.signOut(); user.value=null }

onMounted(() => {
  refreshSession()
  if(!$supabase) return
  $supabase.auth.onAuthStateChange((_e: any, s: any) => { user.value = s?.user || null })
})
</script>

<style scoped>
.header-link:global(.router-link-active){
  color: #fff;
}
</style>
