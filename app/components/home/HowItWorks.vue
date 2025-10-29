<script setup lang="ts">
// Only the text we want to show
const steps = [
  'Upload a photo',
  'Pick size & palette',
  'Generate preview',
  'Export PNG · CSV · PDF'
]
</script>

<template>
  <ol class="mt-[14px] flex flex-wrap items-center justify-center gap-4" role="list" aria-label="How it works">
    <template v-for="(label, i) in steps" :key="label">
      <li>
        <button
          class="inline-flex items-center h-11 rounded-full bg-[#2F3061] text-[#F5F4F1] px-5
                 text-[17px]/[26px] md:text-[18px] font-medium
                 shadow-[0_6px_16px_rgba(0,0,0,0.16)]
                 transition-transform transition-shadow duration-150
                 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF0062]">
          {{ label }}
        </button>
      </li>

      <!-- Lighter chevron between chips; hidden on xs -->
      <span
        v-if="i < steps.length - 1"
        class="hidden sm:inline-flex select-none px-1 text-[#343434]/60 align-middle"
        aria-hidden="true"
      >
        ›
      </span>
    </template>
  </ol>
</template>
