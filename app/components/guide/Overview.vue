<script setup lang="ts">
const props = defineProps<{
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

function fmt(n: number, d = 1) {
  try { return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d) } catch { return String(n) }
}
</script>

<template>
  <section id="project-overview" class="px-8 py-8 max-w-[720px] mx-auto text-[13px] leading-[1.35] text-[#343434]">
    <!-- Title -->
    <h1 class="text-[26px] font-extrabold tracking-tight text-[#343434] mb-4">
      Project Overview
    </h1>

    <!-- Hero image card -->
    <figure class="mx-auto mb-8 max-w-[620px]">
      <div class="rounded-2xl border border-[#2F3061]/25 bg-white p-3 shadow-[0_1px_0_rgba(47,48,97,0.10)]">
        <img :src="heroUrl" alt="Mosaic preview" class="rounded-xl border border-[#343434]/10 w-full h-auto" />
      </div>
    </figure>

    <!-- Specs grid (2×3) -->
    <div class="grid grid-cols-2 gap-x-16 gap-y-8 mb-8">
      <div>
        <div class="spec-label">Stud dimensions</div>
        <div class="spec-value tabular-nums">
          {{ cols }} × {{ rows }} <span class="font-normal">studs</span>
        </div>
      </div>
      <div>
        <div class="spec-label">Total bricks</div>
        <div class="spec-value tabular-nums">
          {{ totalBricks.toLocaleString() }} <span class="font-normal">bricks</span>
        </div>
      </div>
      <div>
        <div class="spec-label">Dimensions (inches)</div>
        <div class="spec-value tabular-nums">
          {{ fmt(widthIn, 1) }} × {{ fmt(heightIn, 1) }} <span class="font-normal">in</span>
        </div>
      </div>
      <div>
        <div class="spec-label">Number of colors</div>
        <div class="spec-value tabular-nums">
          {{ distinctColors }} <span class="font-normal">colors</span>
        </div>
      </div>
      <div>
        <div class="spec-label">Dimensions (centimeters)</div>
        <div class="spec-value tabular-nums">
          {{ fmt(widthCm, 1) }} × {{ fmt(heightCm, 1) }} <span class="font-normal">cm</span>
        </div>
      </div>
      <div>
        <div class="spec-label">Estimated price</div>
        <div class="spec-value tabular-nums">
          <template v-if="estimateUSD != null">Est. ${{ estimateUSD.toFixed(2) }}</template>
          <template v-else>—</template>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <hr class="my-6 border-0 h-px bg-[#2F3061]/15" />

    <!-- Palette -->
    <h2 class="text-base font-semibold text-[#343434] mb-3">Colors used in this build</h2>
    <ul class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-8 gap-y-4">
      <li
        v-for="c in palette"
        :key="c.hex + c.name"
        class="flex items-center gap-3 text-sm min-w-0"
      >
        <span class="h-4 w-4 rounded-sm border border-[#343434]/20" :style="{ backgroundColor: c.hex }" aria-hidden="true"></span>
        <span class="truncate text-[#343434]">{{ c.name }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.spec-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#343434b3}
.spec-value{font-size:16px;line-height:1.25;font-weight:700;color:#343434}
.section-gap{margin-top:18px;margin-bottom:10px}
</style>
