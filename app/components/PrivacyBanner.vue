<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed z-50
             bottom-4 right-4 md:bottom-6 md:right-6
             left-4 md:left-auto
             w-[min(90vw,520px)] max-w-sm
             rounded-2xl bg-brand-purple text-white
             border-2 border-brand-paper/90
             shadow-[0_10px_24px_rgba(0,0,0,0.25)]
             p-5 md:p-6 space-y-4"
      role="region"
      aria-label="Privacy notice"
    >
      <p class="font-sans text-base leading-6">
        We use GA4 analytics (no ads, no selling data) to see what features click and which ones crumble.
        You can change your choice anytime in
        <NuxtLink to="/settings/profile" class="underline underline-offset-2 text-white/90 hover:text-white">Settings</NuxtLink>
        or our
        <NuxtLink to="/privacy" class="underline underline-offset-2 text-white/90 hover:text-white">Privacy Policy</NuxtLink>.
      </p>

      <!-- 50/50 buttons -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="w-full rounded-xl bg-brand-yellow text-white
                 font-medium px-4 py-2.5
                 shadow-[0_2px_0_rgba(0,0,0,0.2)]
                 transition-colors duration-150
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/70
                 hover:bg-pink active:translate-y-[1px]"
          @click="accept"
        >
          Yes, I Accept
        </button>
        <button
          type="button"
          class="w-full rounded-xl bg-brand-yellow text-white
                 font-medium px-4 py-2.5
                 shadow-[0_2px_0_rgba(0,0,0,0.2)]
                 transition-colors duration-150
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/70
                 hover:bg-pink active:translate-y-[1px]"
          @click="decline"
        >
          No Thanks, I Decline
        </button>
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
