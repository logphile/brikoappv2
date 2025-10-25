<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Compare from '~/components/ui/Compare.vue'

const props = defineProps<{
  first: string
  second: string
  altFirst?: string
  altSecond?: string
}>()

const hasICS = ref(false)
onMounted(() => {
  try { hasICS.value = !!(window as any).__icsLoaded } catch { hasICS.value = false }
})
</script>

<template>
  <div class="rounded-2xl ring-1 ring-black/10 overflow-hidden shadow-card">
    <div class="aspect-[4/3] md:aspect-[16/9]">
      <ClientOnly>
        <img-comparison-slider v-if="hasICS" class="w-full h-full compare-purple">
          <img slot="first"  :src="first"  :alt="altFirst || 'Original'" />
          <img slot="second" :src="second" :alt="altSecond || 'Mosaic'" />
        </img-comparison-slider>
        <Compare v-else :left="second" :right="first" ratio="4/3" :start="50" />
      </ClientOnly>
    </div>
  </div>
</template>
