<script setup lang="ts">
import Spec from './Spec.vue'

defineProps<{
  heroUrl: string
  // Specs
  cols: number
  rows: number
  totalBricks: number
  widthIn: number
  heightIn: number
  widthCm: number
  heightCm: number
  distinctColors: number
  estimateUSD?: number
  // Palette
  palette: Array<{ name: string; hex: string }>
}>()
</script>

<template>
  <section id="project-overview"
           class="mx-auto max-w-[720px] px-10 py-10 print:break-inside-avoid text-[13px] leading-[1.35] text-[#343434]">
    <!-- Title -->
    <h1 class="text-[26px] font-extrabold tracking-tight text-[#343434] mb-6">
      Project Overview
    </h1>

    <!-- Hero image card -->
    <figure class="mx-auto mb-10 max-w-[640px]">
      <div class="rounded-2xl border border-[#2F3061]/25 bg-white p-3 shadow-[0_1px_0_rgba(47,48,97,0.10)]">
        <img :src="heroUrl" alt="Mosaic preview" class="rounded-xl border border-[#343434]/10 w-full h-auto" />
      </div>
    </figure>

    <!-- Specs grid (2×3) -->
    <div class="grid grid-cols-2 gap-x-20 gap-y-8 mb-10">
      <Spec label="Stud dimensions"          :value="`${cols} × ${rows}`"               unit="studs" />
      <Spec label="Total bricks"             :value="totalBricks.toLocaleString()"     unit="bricks" />
      <Spec label="Dimensions (inches)"      :value="`${widthIn.toFixed(1)} × ${heightIn.toFixed(1)}`" unit="in" />
      <Spec label="Number of colors"         :value="String(distinctColors)"           unit="colors" />
      <Spec label="Dimensions (centimeters)" :value="`${widthCm.toFixed(1)} × ${heightCm.toFixed(1)}`" unit="cm" />
      <Spec label="Estimated price"          :value="estimateUSD != null ? `Est. $${estimateUSD.toFixed(2)}` : '—'" />
    </div>

    <!-- Divider -->
    <hr class="my-6 border-0 h-px bg-[#2F3061]/15" />

    <!-- Palette -->
    <h2 class="text-base font-semibold text-[#343434] mb-4">
      Colors used in this build
    </h2>

    <!-- fixed column grid so rows align; wraps cleanly -->
    <ul class="grid grid-cols-4 gap-x-10 gap-y-6">
      <li v-for="c in palette" :key="c.hex" class="flex items-center gap-3 text-sm min-w-0">
        <span class="h-4 w-4 rounded-sm border border-[#343434]/20" :style="{ backgroundColor: c.hex }" aria-hidden="true"></span>
        <span class="truncate text-[#343434]">{{ c.name }}</span>
      </li>
    </ul>
  </section>
</template>
