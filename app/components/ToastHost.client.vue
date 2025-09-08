<template>
  <div class="toast-viewport fixed z-[1000] right-3 space-y-2 w-full max-w-sm pointer-events-none"
       :style="{ top: `calc(var(--app-header-h, 64px) + env(safe-area-inset-top) + 12px)` }">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[
          'pointer-events-auto rounded-xl px-4 py-3 shadow ring-1 text-sm flex items-start gap-3',
          t.type === 'success' ? 'bg-green-500/15 ring-green-400/30 text-green-50' :
          t.type === 'error' ? 'bg-red-500/15 ring-red-400/30 text-red-50' :
                               'bg-white/10 ring-white/20 text-white'
        ]"
      >
        <div class="mt-0.5">
          <span v-if="t.type==='success'">✅</span>
          <span v-else-if="t.type==='error'">⚠️</span>
          <span v-else>ℹ️</span>
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
