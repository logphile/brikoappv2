<template>
  <button
    class="inline-flex items-center justify-center rounded-lg bg-brand-a1 px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
