<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  images: { src: string; alt?: string }[]
}>()

// Local state per instance
const current = ref(0)

// Guard: warn if no images passed
watchEffect(() => {
  if (!props.images || props.images.length === 0) {
    console.warn('TransitionSlider received no images')
  } else if (current.value >= props.images.length) {
    current.value = 0
  }
})

// Optional: auto-advance (commented out; enable if desired)
// onMounted(() => {
//   const id = setInterval(() => {
//     if (props.images?.length) current.value = (current.value + 1) % props.images.length
//   }, 4000)
//   onBeforeUnmount(() => clearInterval(id))
// })
</script>

<template>
  <!-- Aspect ratio prevents collapse when children are absolutely positioned -->
  <div class="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-black/10">
    <img
      v-for="img in props.images"
      :key="img.src"
      :src="img.src"
      :alt="img.alt || ''"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      :class="img.src === props.images[current]?.src ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'"
      loading="eager"
      decoding="async"
    />

    <!-- TEMP debug overlay -->
    <div class="absolute bottom-2 right-3 z-20 text-[11px] px-2 py-1 rounded bg-black/60 text-white">
      {{ props.images?.[current]?.src || 'no image' }}
    </div>
  </div>
</template>
