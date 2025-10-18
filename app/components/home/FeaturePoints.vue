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
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-5">
    <div v-for="(it,i) in items" :key="i" class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 transition hover:-translate-y-0.5">
      <h3 class="feature-card__title">{{ it.title }}</h3>
      <p class="feature-card__text">{{ it.blurb }}</p>
    </div>
  </div>
</template>
