<script setup lang="ts">
import IconChevronRight from '~/components/icons/IconChevronRight.vue'

// Only the text we want to show
const steps = [
  'Upload a photo',
  'Pick size & palette',
  'Generate preview',
  'Export PNG · CSV · PDF'
]
</script>

<template>
  <div class="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
    <template v-for="(label, i) in steps" :key="label">
      <!-- Chip with text only -->
      <span
        class="inline-flex items-center rounded-full bg-[#2F3061] text-[#F5F4F1]
               px-4 py-2 md:px-5 md:py-2.5 shadow-[0_6px_16px_rgba(0,0,0,.18)]
               leading-none text-sm md:text-[15px] font-semibold"
      >
        {{ label }}
      </span>

      <!-- Larger chevron between chips -->
      <IconChevronRight
        v-if="i < steps.length - 1"
        class="text-[#343434]/80 w-5 h-5 md:w-6 md:h-6 mx-1 md:mx-2"
        aria-hidden="true"
      />
    </template>
  </div>
</template>
