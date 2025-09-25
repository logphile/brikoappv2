<script setup lang="ts"></script>

<template>
  <div class="text-[#343434]">
    <!-- Feature bites with Material icons in neutral ink; no mint badges -->
    <ul class="space-y-3">
      <!-- 1 -->
      <li
        class="group flex items-start gap-4 rounded-xl border-2 border-[#FF0062] bg-white/5
               p-4 transition hover:border-[#FF0062] hover:bg-white/[0.07]"
      >
        <!-- Icon (pink) -->
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">bolt</span>
        </span>
        <!-- Copy -->
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Instant</span> LEGO-style color mapping
        </p>
      </li>

      <!-- 2 -->
      <li
        class="group flex items-start gap-4 rounded-xl border-2 border-[#FF0062] bg-white/5
               p-4 transition hover:border-[#FF0062] hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">grid_view</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Greedy tiling</span> → fewer plates, cleaner look
        </p>
      </li>

      <!-- 3 -->
      <li
        class="group flex items-start gap-4 rounded-xl border-2 border-[#FF0062] bg-white/5
               p-4 transition hover:border-[#FF0062] hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">receipt_long</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          Auto <span class="font-semibold">Bill of Materials</span> + cost estimate
        </p>
      </li>

      <!-- 4 -->
      <li
        class="group flex items-start gap-4 rounded-xl border-2 border-[#FF0062] bg-white/5
               p-4 transition hover:border-[#FF0062] hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-pink-500">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">download</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          One-click exports: <span class="font-semibold">PNG · CSV · PDF</span>
        </p>
      </li>
    </ul>

    <!-- Section CTA (two-line) -->
    <div class="mt-5">
      <ButtonPrimarySublabel
        to="/mosaic"
        label="Start free"
        sublabel="No signup • Instant preview"
        data-cta="section-start-free"
      />
    </div>
  </div>
</template>
