<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
      role="region"
      aria-label="Privacy notice"
    >
      <div class="mx-auto max-w-4xl rounded-2xl bg-white/8 backdrop-blur border border-white/10 shadow-lg">
        <div class="px-5 py-4 sm:px-6 sm:py-5">
          <p class="text-sm text-white/90 leading-[1.4]">
            We use GA4 analytics (no ads, no selling data) to see what features click and which ones crumble.
            You can change your choice anytime in
            <NuxtLink to="/settings" class="underline decoration-white/40 hover:decoration-white">Settings</NuxtLink>
            or our
            <NuxtLink to="/privacy" class="underline decoration-white/40 hover:decoration-white">Privacy Policy</NuxtLink>.
          </p>

          <!-- 50/50 buttons -->
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="h-10 rounded-xl bg-mint text-ink font-medium text-sm flex items-center justify-center hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
              @click="accept"
            >
              Yes, I Accept
            </button>
            <button
              type="button"
              class="h-10 rounded-xl bg-white/10 text-white/90 text-sm flex items-center justify-center hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              @click="decline"
            >
              No Thanks, I Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const KEY = 'briko.analyticsConsent'
const show = ref(false)

onMounted(() => {
  try {
    const v = localStorage.getItem(KEY)
    if (!v) {
      // default = denied (Consent Mode v2 safe default)
      ;(window as any).gtag?.('consent', 'default', { analytics_storage: 'denied' })
      show.value = true
    }
  } catch {
    show.value = true
  }
})

function accept() {
  try {
    localStorage.setItem(KEY, 'granted')
    // Consent Mode update (works with GTM or direct gtag)
    ;(window as any).gtag?.('consent', 'update', { analytics_storage: 'granted' })
    // If we lazy-load GA (see plugin below), load now:
    window.dispatchEvent(new CustomEvent('briko-consent-granted'))
  } catch {}
  show.value = false
}

function decline() {
  try {
    localStorage.setItem(KEY, 'denied')
    ;(window as any).gtag?.('consent', 'update', { analytics_storage: 'denied' })
  } catch {}
  show.value = false
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
