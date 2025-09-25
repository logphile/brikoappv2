<template>
  <NuxtLink
    :to="to"
    class="foot-brick group"
  >
    <span class="label">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; label: string }>()
</script>

<style scoped>
/* Base link: navy default; comfy tap target; underline offset */
.foot-brick {
  display: inline-block;
  position: relative;
  font-size: 0.875rem; /* text-sm */
  padding: 0.25rem 0.25rem; /* px-1 py-1 */
  border-radius: 0.5rem; /* rounded-lg */
  color: #2F3061; /* navy */
  text-decoration: none;
  text-underline-offset: 2px; /* underline-offset-2 */
  text-decoration-thickness: from-font;
  outline: none;
  transition: color .2s ease, text-decoration-color .2s ease, box-shadow .2s ease;
}

.foot-brick:hover {
  color: #FF0062; /* pink */
  text-decoration: underline;
}

.foot-brick:focus-visible {
  color: #FF0062;
  text-decoration: underline;
  /* pink ring with yellow offset to read on yellow footer bg */
  box-shadow: 0 0 0 2px #FF0062, 0 0 0 4px #FFD808;
}

.label { position: relative; z-index: 1; }
</style>
