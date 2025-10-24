<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
    <div class="w-full max-w-md bg-[#2F3061]/5 border border-[#2F3061]/20 rounded-2xl p-8 shadow-xl">
      <h1 class="text-3xl font-semibold text-[#2F3061] mb-6 text-center">
        💬 Send Feedback
      </h1>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label for="message" class="block text-sm text-[#2F3061]/70 mb-1">Message *</label>
          <textarea id="message" v-model="message" required rows="5"
            class="w-full rounded-xl border border-[#2F3061]/30 bg-white/80 focus:ring-2 focus:ring-[#FFD808] p-3 text-[#2F3061] resize-none"
            placeholder="What went wrong or could be better?"></textarea>
        </div>
        <div>
          <label for="email" class="block text-sm text-[#2F3061]/70 mb-1">Email (optional)</label>
          <input id="email" type="email" v-model="email"
            class="w-full rounded-xl border border-[#2F3061]/30 bg-white/80 focus:ring-2 focus:ring-[#FFD808] p-3 text-[#2F3061]"
            placeholder="you@example.com" />
        </div>
        <button type="submit"
          class="w-full py-3 rounded-xl font-medium bg-[#2F3061] text-white hover:bg-[#403E7A] transition">
          {{ loading ? 'Sending…' : 'Send Feedback' }}
        </button>
      </form>

      <p v-if="sent" class="text-center text-[#2F3061] mt-6">
        Thanks for your feedback! 💛
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitFeedback } from '@/composables/useFeedback'

const message = ref('')
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
  if (!message.value.trim()) return
  loading.value = true
  try {
    await submitFeedback(message.value, email.value)
    sent.value = true
    message.value = ''
    email.value = ''
  } catch (e) {
    console.error('Feedback error', e)
    alert('Could not send feedback. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
