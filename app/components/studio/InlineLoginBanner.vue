<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
const KEY = 'briko.hideLoginCta.v1'

const visible = ref(false)
function computeVisible() {
  try { return !user.value && !localStorage.getItem(KEY) } catch { return !user.value }
}

onMounted(() => { visible.value = computeVisible() })
watch(() => user.value, () => { visible.value = computeVisible() })

function goLogin() { navigateTo({ path: '/login', query: { next: '/studio' } }) }
function dismiss() { visible.value = false; try { localStorage.setItem(KEY, '1') } catch {} }
</script>

<template>
  <div v-if="visible"
       class="mt-2 inline-flex max-w-full items-center gap-2 rounded-full
              border border-mint/40 bg-mint/10 px-3 py-1.5 text-sm text-mint
              shadow-[0_0_0_1px_rgba(0,229,160,.15)_inset]">
    <span class="text-white/85">Log in to see your projects</span>
    <button class="btn-mint px-3 py-1 text-sm" @click="goLogin">Log in</button>
    <button class="ml-1 rounded-full bg-white/5 p-1 leading-none
                   text-white/70 hover:bg-white/10"
            aria-label="Dismiss" @click="dismiss">×</button>
  </div>
</template>
