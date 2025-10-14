<script setup lang="ts">
type Item = { title: string; blurb: string }
const items: Item[] = [
  { title: 'Instant LEGO-style color mapping', blurb: 'Automatic brick-color remap for any photo.' },
  { title: 'Greedy tiling',                    blurb: 'Fewer plates, cleaner joins, faster build.' },
  { title: 'Auto Bill of Materials',           blurb: 'Brick count and cost estimate in one click.' },
  { title: 'One-click export',                 blurb: 'PNG · CSV · PDF build guide.' },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
    <div
      v-for="(it,i) in items"
      :key="i"
      class="rounded-2xl bg-ink/60 border border-ink/25 p-4 lg:p-5 shadow-sm hover:border-mint/40 hover:ring-1 hover:ring-mint/20 transition"
    >
      <div class="flex items-start gap-3">
        <span class="mt-1 inline-block h-2 w-2 rounded-full bg-mint"></span>
        <div>
          <h3 class="font-slab text-purple-200 text-base leading-tight">{{ it.title }}</h3>
          <p class="text-white/80 text-sm mt-1">{{ it.blurb }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
