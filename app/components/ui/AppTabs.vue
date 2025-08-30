<template>
  <div>
    <div class="mb-2 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="model = tab"
        class="rounded-md px-3 py-1 text-sm"
        :class="model === tab ? 'bg-brand-a2 text-black' : 'bg-black/20 text-white/70'"
      >
        {{ tab }}
      </button>
    </div>
    <slot :active="model" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ modelValue: string; tabs: string[] }>()
const emit = defineEmits(['update:modelValue'])
const model = useVModel(props, 'modelValue', emit)
</script>
