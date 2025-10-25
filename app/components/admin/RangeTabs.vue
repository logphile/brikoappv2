<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue: number, options?: number[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v:number):void }>()
const opts = computed(() => props.options ?? [7,30,90])
</script>

<template>
  <div class="inline-flex rounded-xl border border-black/10 bg-white/60 backdrop-blur p-1" role="tablist" aria-label="Select analytics range">
    <button
      v-for="d in opts" :key="d"
      class="px-3 py-1 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
      :class="d === modelValue ? 'bg-black/90 text-white' : 'text-black/70 hover:bg-black/5'"
      :aria-pressed="d === modelValue"
      :aria-label="`Show last ${d} days`"
      @click="$emit('update:modelValue', d)"
    >{{ d }}d</button>
  </div>
</template>
