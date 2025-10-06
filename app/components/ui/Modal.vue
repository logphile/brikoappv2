<script setup lang="ts">
import { onBeforeUnmount, watch, nextTick, ref } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const lastActive = ref<HTMLElement | null>(null)

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') emit('close')
}

watch(() => props.open, async (v) => {
  try {
    if (v) {
      lastActive.value = (document.activeElement as HTMLElement) || null
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      await nextTick()
      lastActive.value?.focus?.()
    }
  } catch {}
}, { immediate: true })

onBeforeUnmount(() => {
  try { document.removeEventListener('keydown', onKeydown) } catch {}
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal fixed inset-0 z-[2000]">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
        <!-- container -->
        <div class="absolute inset-0 grid place-items-center p-4">
          <div
            class="w-full max-w-lg rounded-2xl border border-white/10 bg-[#2F3061] text-white shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
