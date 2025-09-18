<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  show: boolean
  x: number
  y: number
  part: {
    brick: string
    color: string
    count?: number
    link?: string
  }
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const style = computed(() => {
  const pad = 16, w = 280, h = 96
  const left = Math.min(props.x + 16, window.innerWidth - w - pad)
  const top  = Math.min(props.y + 16, window.innerHeight - h - pad)
  return { left: `${left}px`, top: `${top}px` }
})

function onKey(e: KeyboardEvent){ if (e.key === 'Escape') emit('close') }

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <teleport to="body">
    <div v-show="show"
         class="fixed z-[60] pointer-events-none"
         :style="style"
         role="tooltip" aria-live="polite">
      <div
        class="max-w-[280px] rounded-xl px-3 py-2 shadow-xl ring-1 backdrop-blur
               bg-[#111827]/95 ring-[#00E5A0]/40 text-white select-none">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-6 min-w-[32px] items-center justify-center
                       rounded-md text-xs font-semibold
                       bg-[#00E5A0]/20 text-[#00E5A0]">
            {{ part.brick.split(' ')[1] ?? '—' }}
          </span>
          <div class="text-sm font-medium leading-tight truncate">{{ part.brick }}</div>
        </div>
        <div class="mt-1 text-[12px] opacity-85">
          {{ part.color }}
          <template v-if="part.count"> · In parts list: ×{{ part.count }}</template>
          <template v-if="part.link">
            · <a :href="part.link" class="text-[#00E5A0] underline underline-offset-2">View</a>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>
