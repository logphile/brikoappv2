<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e:'export'): void }>()
</script>

<template>
  <Modal :open="open" @close="open = false">
    <div class="form-dark">
      <header class="px-5 py-4 border-b border-white/10">
        <h3 class="text-lg font-semibold">BrickLink Export</h3>
      </header>

      <div class="px-5 py-4 space-y-4 text-sm leading-6">
        <p class="text-white/80">
          Generate a BrickLink-compatible XML. Prices and availability vary by region and seller.
        </p>

        <fieldset class="space-y-2">
          <legend class="font-medium">Condition</legend>
          <label class="flex items-center gap-2">
            <input type="radio" name="cond" value="new" class="accent-yellow-300" checked />
            <span>New</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" name="cond" value="used" class="accent-yellow-300" />
            <span>Used</span>
          </label>
        </fieldset>

        <label class="flex items-center gap-2">
          <input type="checkbox" class="accent-yellow-300" checked />
          <span>Add remarks “Briko • Mosaic”</span>
        </label>
      </div>

      <footer class="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
        <button class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" @click="open=false">Cancel</button>
        <button class="px-3 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-black font-medium"
                @click="emit('export')">
          Export .xml
        </button>
      </footer>
    </div>
  </Modal>
</template>
