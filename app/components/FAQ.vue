<template>
  <div class="divide-y divide-[color:var(--ivory-border)]">
    <details v-for="(f,i) in items" :key="i" class="py-3 group">
      <summary class="cursor-pointer list-none flex items-center justify-between gap-4">
        <h3 :id="slugify(f.q)" class="h3">{{ f.q }}</h3>
        <span class="text-sm text-[color:var(--purple)] group-open:rotate-90 transition">›</span>
      </summary>
      <p class="mt-2 text-[color:var(--text-dim)]">{{ f.a }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { q: string; a: string }[] }>()
function slugify(s: string){
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,64)
}
</script>
