<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)

onMounted(() => {
  try {
    const stored = localStorage.getItem('briko_consent')
    show.value = !stored
    if (stored === 'granted' && typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('consent', 'update', { analytics_storage: 'granted' })
    }
  } catch {
    show.value = true
  }
})

function accept() {
  try {
    // Grant analytics consent (we're not using ads)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', { analytics_storage: 'granted' })
    }
    localStorage.setItem('briko_consent', 'granted')
  } catch {}
  show.value = false
}

function decline() {
  try {
    localStorage.setItem('briko_consent', 'denied')
  } catch {}
  show.value = false
}
</script>

<template>
  <div
    v-if="show"
    class="fixed bottom-4 inset-x-4 md:right-4 md:inset-x-auto z-50 max-w-lg p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur"
  >
    <p class="text-sm opacity-90">
      We use privacy-friendly analytics (GA4) to improve Briko. Accept to help us measure usage.
    </p>
    <div class="mt-3 flex gap-2">
      <button type="button" @click="accept" class="px-4 py-2 rounded-lg bg-pacific text-white font-semibold">Accept</button>
      <button type="button" @click="decline" class="px-4 py-2 rounded-lg border border-white/20">Decline</button>
    </div>
  </div>
</template>
