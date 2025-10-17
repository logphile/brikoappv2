<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()
const emit = defineEmits<{ (e:'confirm'):void; (e:'close'):void }>()
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[70]">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')" />
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-2xl bg-white text-gray-900 shadow-xl">
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-1">{{ props.title || 'Are you sure?' }}</h2>
            <p class="text-sm opacity-80">{{ props.message || 'This action cannot be undone.' }}</p>
            <div class="mt-4 flex justify-end gap-2">
              <button
                class="inline-flex items-center justify-center h-9 px-4 rounded-full text-sm
                       ring-1 ring-black/10 bg-white hover:bg-black/5"
                @click="emit('close')">
                {{ props.cancelLabel || 'Cancel' }}
              </button>
              <button
                :class="[
                  'inline-flex items-center justify-center h-9 px-4 rounded-full text-sm text-white',
                  props.danger
                    ? 'bg-[#FF0062] hover:bg-[#ff1c73]'
                    : 'bg-black hover:bg-black/90'
                ]"
                @click="emit('confirm')">
                {{ props.confirmLabel || 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
