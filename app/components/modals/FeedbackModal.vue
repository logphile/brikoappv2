<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-[400px] p-6 relative">
        <button @click="emit('close')" class="absolute top-3 right-3 text-[#2F3061]/50 hover:text-[#2F3061]">✖</button>
        <h2 class="text-xl font-semibold text-[#2F3061] mb-3">💬 Feedback</h2>
        <form @submit.prevent="submit" class="space-y-3">
          <textarea v-model="message" rows="4" placeholder="Share a thought or report a bug"
            class="w-full rounded-xl border border-[#2F3061]/30 bg-white/80 p-3 focus:ring-2 focus:ring-[#FFD808] text-[#2F3061]" />
          <input v-model="email" type="email" placeholder="Email (optional)"
            class="w-full rounded-xl border border-[#2F3061]/30 bg-white/80 p-3 focus:ring-2 focus:ring-[#FFD808] text-[#2F3061]" />
          <button type="submit"
            class="w-full py-2.5 rounded-xl bg-[#2F3061] text-white hover:bg-[#403E7A] transition">
            {{ sending ? 'Sending…' : 'Send' }}
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitFeedback } from '@/composables/useFeedback'
const emit = defineEmits(['close'])
const props = defineProps({ show: Boolean })

const message = ref('')
const email = ref('')
const sending = ref(false)

async function submit() {
  if (!message.value.trim()) return
  sending.value = true
  try {
    await submitFeedback(message.value, email.value)
    emit('close')
  } catch (e) {
    console.error(e)
    alert('Could not send feedback.')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
