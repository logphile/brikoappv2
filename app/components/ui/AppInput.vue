<template>
  <label class="block text-sm">
    <span class="mb-1 block opacity-80"><slot name="label" /></span>
    <input
      class="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-a2"
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string | number }>()
defineEmits(['update:modelValue'])
</script>
