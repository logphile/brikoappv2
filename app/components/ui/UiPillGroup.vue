<script setup lang="ts">
const props = defineProps<{
  options: { label: string; value: string }[]
  modelValue: string
  dense?: boolean
}>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="inline-flex gap-2">
    <button
      v-for="opt in options" :key="opt.value"
      class="rounded-xl px-3"
      :class="[
        props.dense ? 'h-8 text-sm' : 'h-9 text-sm',
        opt.value === props.modelValue
          ? 'bg-pink text-white'
          : 'ring-1 ring-black/10 bg-white/70 text-black hover:bg-white'
      ]"
      @click="emit('update:modelValue', opt.value)"
    >{{ opt.label }}</button>
  </div>
</template>
