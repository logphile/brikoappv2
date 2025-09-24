<script setup lang="ts">
/**
 * Action buttons for Mosaic flow.
 * Emits events to be handled by parent page.
 */
import ButtonPrimary from '@/components/ui/ButtonPrimary.vue'
import ButtonOutline from '@/components/ui/ButtonOutline.vue'
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
  ghost: 'text-white/80 hover:text-white hover:bg-white/5',
  row: 'grid grid-cols-1 gap-3',
  row2: 'grid grid-cols-1 sm:grid-cols-2 gap-3'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Row 1: Primary CTA -->
    <div :class="btn.row">
      <ButtonPrimary type="button" :disabled="!canGenerate || busy" @click="emit('generate')">
        Generate Mosaic
      </ButtonPrimary>
      <!-- <p class="text-xs text-white/50">Step 1: generate your mosaic preview.</p> -->
    </div>

    <!-- Row 2: Default next step (save private) -->
    <div :class="btn.row">
      <ButtonOutline type="button" :disabled="!canSave || busy" @click="emit('savePrivate')">
        Save to Gallery (private)
      </ButtonOutline>
      <!-- <p class="text-xs text-white/50">Step 2: save privately to your gallery.</p> -->
    </div>

    <!-- Row 3: Publish options -->
    <div :class="btn.row2">
      <ButtonPrimary type="button" :disabled="!canSave || busy" @click="emit('saveAndPublish')">
        Save &amp; Publish
      </ButtonPrimary>

      <ButtonOutline type="button" :disabled="!canPublish || busy" @click="emit('publish')">
        Make Public
      </ButtonOutline>
    </div>

    <!-- Row 4: Utilities (de-emphasized) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium
               text-white/80 hover:text-white hover:bg-white/5 transition duration-200 ease-out
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70
               disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="busy"
        @click="emit('saveProjectLegacy')"
      >
        Save Project
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium
               text-white/80 hover:text-white hover:bg-white/5 transition duration-200 ease-out
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70
               disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="busy"
        @click="emit('uploadPreview')"
      >
        Upload Preview
      </button>
    </div>
  </div>
</template>
