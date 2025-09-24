<script setup lang="ts"></script>

<template>
  <div class="text-[#343434]">
    <!-- Feature bites with Material icons in neutral ink; no mint badges -->
    <ul class="space-y-3">
      <!-- 1 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <!-- Icon (pink) -->
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500 opacity-90 group-hover:opacity-100 transition">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">bolt</span>
        </span>
        <!-- Copy -->
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Instant</span> LEGO-style color mapping
          <span class="ml-1 inline-block rounded-full bg-[#111827]/10 px-2 py-0.5 text-xs text-[#111827]/80">
            wow moment
          </span>
        </p>
      </li>

      <!-- 2 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500 opacity-90 group-hover:opacity-100 transition">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">grid_view</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Greedy tiling</span> → fewer plates, cleaner look
        </p>
      </li>

      <!-- 3 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500 opacity-90 group-hover:opacity-100 transition">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">receipt_long</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          Auto <span class="font-semibold">Bill of Materials</span> + cost estimate
        </p>
      </li>

      <!-- 4 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500 opacity-90 group-hover:opacity-100 transition">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">download</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          One-click exports: <span class="font-semibold">PNG · CSV · PDF</span>
        </p>
      </li>
    </ul>

    <!-- Trust badges / stats row (equal width, fills the column) -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      <!-- Badge 1 -->
      <div class="chip inline-flex items-center justify-center gap-2 rounded-full border border-pink-500/90 px-3 py-1 bg-white/70 backdrop-blur-sm hover:bg-pink-500/5 hover:ring-1 hover:ring-pink-500 transition min-h-[44px]">
        <span class="material-symbols-rounded h-4 w-4 text-pink-500 text-[18px]" aria-hidden="true">speed</span>
        <span class="whitespace-nowrap text-[#111827] text-sm font-medium">&lt; 2s preview</span>
      </div>

      <!-- Badge 2 -->
      <div class="chip inline-flex items-center justify-center gap-2 rounded-full border border-pink-500/90 px-3 py-1 bg-white/70 backdrop-blur-sm hover:bg-pink-500/5 hover:ring-1 hover:ring-pink-500 transition min-h-[44px]">
        <span class="material-symbols-rounded h-4 w-4 text-pink-500 text-[18px]" aria-hidden="true">check_circle</span>
        <span class="whitespace-nowrap text-[#111827] text-sm font-medium">Free to try</span>
      </div>

      <!-- Badge 3 -->
      <div class="chip inline-flex items-center justify-center gap-2 rounded-full border border-pink-500/90 px-3 py-1 bg-white/70 backdrop-blur-sm hover:bg-pink-500/5 hover:ring-1 hover:ring-pink-500 transition min-h-[44px]">
        <span class="material-symbols-rounded h-4 w-4 text-pink-500 text-[18px]" aria-hidden="true">lock_open</span>
        <span class="whitespace-nowrap text-[#111827] text-sm font-medium">No signup required</span>
      </div>
    </div>
  </div>
</template>
