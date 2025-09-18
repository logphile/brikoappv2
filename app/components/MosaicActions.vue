<script setup lang="ts">
/**
 * Action buttons for Mosaic flow.
 * Emits events to be handled by parent page.
 */
const props = defineProps<{
  canGenerate: boolean
  canSave: boolean
  canPublish: boolean
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'savePrivate'): void
  (e: 'saveAndPublish'): void
  (e: 'publish'): void
  (e: 'uploadPreview'): void
  (e: 'saveProjectLegacy'): void
}>()

const btn = {
  base: 'w-full rounded-xl px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_0_1px_rgba(255,255,255,.06)]',
  outline: 'border border-white/15 text-white hover:border-white/30 hover:bg-white/5',
  ghost: 'text-white/80 hover:text-white hover:bg-white/5',
  row: 'grid grid-cols-1 gap-3',
  row2: 'grid grid-cols-1 sm:grid-cols-2 gap-3'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Row 1: Primary CTA -->
    <div :class="btn.row">
      <button
        :class="[btn.base, btn.primary]"
        :disabled="!canGenerate || busy"
        @click="emit('generate')"
      >
        Generate Mosaic
      </button>
      <!-- <p class="text-xs text-white/50">Step 1: generate your mosaic preview.</p> -->
    </div>

    <!-- Row 2: Default next step (save private) -->
    <div :class="btn.row">
      <button
        :class="[btn.base, btn.outline]"
        :disabled="!canSave || busy"
        @click="emit('savePrivate')"
      >
        Save to Gallery (private)
      </button>
      <!-- <p class="text-xs text-white/50">Step 2: save privately to your gallery.</p> -->
    </div>

    <!-- Row 3: Publish options -->
    <div :class="btn.row2">
      <button
        :class="[btn.base, btn.primary]"
        :disabled="!canSave || busy"
        @click="emit('saveAndPublish')"
      >
        Save &amp; Publish
      </button>

      <button
        :class="[btn.base, btn.outline]"
        :disabled="!canPublish || busy"
        @click="emit('publish')"
      >
        Make Public
      </button>
    </div>

    <!-- Row 4: Utilities (de-emphasized) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        :class="[btn.base, btn.ghost, 'py-2']"
        :disabled="busy"
        @click="emit('saveProjectLegacy')"
      >
        Save Project
      </button>
      <button
        :class="[btn.base, btn.ghost, 'py-2']"
        :disabled="busy"
        @click="emit('uploadPreview')"
      >
        Upload Preview
      </button>
    </div>
  </div>
</template>
