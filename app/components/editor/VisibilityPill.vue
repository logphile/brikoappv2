<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
const setPrivate = () => emit('update:modelValue', false)
const setPublic = () => emit('update:modelValue', true)
</script>

<template>
  <div class="inline-flex rounded-full border text-xs font-medium overflow-hidden">
    <button
      class="px-3 py-1 transition"
      :class="!modelValue ? 'bg-white/10 border-r border-white/10 text-white' : 'bg-transparent text-white/60 hover:text-white'"
      @click="setPrivate"
      type="button"
      :aria-pressed="!modelValue"
    >
      Private
    </button>
    <button
      class="px-3 py-1 transition"
      :class="modelValue ? 'bg-green-500/20 text-green-200' : 'bg-transparent text-white/60 hover:text-white'"
      @click="setPublic"
      type="button"
      :aria-pressed="modelValue"
    >
      Public
    </button>
  </div>
</template>
