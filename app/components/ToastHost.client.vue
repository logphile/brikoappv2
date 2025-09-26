<template>
  <div class="toast-viewport fixed z-[1000] right-3 space-y-2 w-full max-w-sm pointer-events-none"
       :style="{ top: `calc(var(--app-header-h, 64px) + env(safe-area-inset-top) + 12px)` }">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[
          'pointer-events-auto rounded-xl px-4 py-3 shadow-lg ring-1 text-sm flex items-start gap-3',
          t.type === 'error' ? 'bg-[#FF0062] ring-[#FF0062]/30 text-[#FFD808]' :
          t.type === 'success' ? 'bg-[#2F3061] ring-white/10 text-white' :
                                 'bg-[#2F3061] ring-white/10 text-white'
        ]"
      >
        <div class="mt-0.5">
          <span v-if="t.type==='success'" class="toast-icon success" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </span>
          <span v-else-if="t.type==='error'" aria-hidden="true">⚠️</span>
          <span v-else aria-hidden="true">ℹ️</span>
        </div>
        <div class="grow">{{ t.message }}</div>
        <button class="opacity-70 hover:opacity-100" @click="dismiss(t.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToasts } from '@/composables/useToasts'
const { toasts, dismiss } = useToasts()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-8px); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* Success icon micro-animation */
.toast-icon.success { display: inline-flex; animation: toast-pop .22s ease-out both; }
.toast-icon.success svg path {
  stroke-dasharray: 22;
  stroke-dashoffset: 22;
  animation: toast-draw .38s ease-out .06s forwards;
}
@keyframes toast-pop { from { transform: scale(.85); opacity: .7 } to { transform: scale(1); opacity: 1 } }
@keyframes toast-draw { to { stroke-dashoffset: 0 } }

@media (max-width: 640px) {
  .toast-viewport {
    top: auto !important;
    bottom: calc(env(safe-area-inset-bottom) + 12px) !important;
    right: 12px !important;
    left: 12px !important;
    max-width: none !important;
  }
}
</style>
