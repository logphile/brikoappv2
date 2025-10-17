<script setup lang="ts">
import { useHead, useError, clearError, computed } from '#imports'
import AppButton from '@/components/ui/AppButton.vue'

const err = useError()
const status = computed<number>(() => Number(err.value?.statusCode || 500))
const headline = computed(() =>
  status.value === 404 ? 'Page not found' : 'Something went wrong'
)
const detail = computed(() => {
  const e = err.value as any
  return JSON.stringify(
    { statusCode: e?.statusCode, message: e?.message, url: e?.url },
    null, 2
  )
})
const handleErrorText = computed(() => JSON.stringify(err.value, null, 2))

useHead({
  title: `${status.value} — ${headline.value}`,
  meta: [{ name: 'robots', content: 'noindex' }]
})

function goHome () {
  clearError({ redirect: '/' })
}

async function copyDetails () {
  try {
    await navigator.clipboard?.writeText(detail.value)
  } catch {}
}
</script>

<template>
  <main class="min-h-[70vh] grid place-items-center px-6 py-16">
    <div class="max-w-xl w-full rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-8">
      <p class="text-sm uppercase tracking-wider opacity-60">Error {{ status }}</p>
      <h1 class="mt-1 text-3xl font-extrabold">{{ headline }}</h1>
      <p class="mt-2 opacity-80">
        If this keeps happening, please let us know what you were doing.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <AppButton to="/" label="Back home" />
        <AppButton to="/how-it-works" label="How it works" />
        <AppButton href="https://github.com/logphile/Briko/issues/new" label="Report issue" />
        <AppButton :href="`mailto:support@briko.app?subject=Error&body=${encodeURIComponent(handleErrorText)}`" label="Copy details" />
      </div>

      <details class="mt-6">
        <summary class="cursor-pointer opacity-80">Technical details</summary>
        <pre class="mt-3 max-h-60 overflow-auto text-xs leading-relaxed p-3 bg-black/30 rounded">{{ detail }}</pre>
      </details>
    </div>
  </main>
</template>

<style scoped>
/* Button recipes are provided globally in app/assets/css/briko.css */
</style>
