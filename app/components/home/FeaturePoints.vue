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
    <div v-for="(it,i) in items" :key="i" class="feature-wrap">
      <div class="feature-card">
        <div class="flex items-start gap-3">
          <div>
            <div class="feature-title">{{ it.title }}</div>
            <p class="feature-body">{{ it.blurb }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
