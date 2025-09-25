<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'dark' | 'light'; accent?: 'pink' | 'sun' }>(), { tone: 'dark', accent: 'pink' })
</script>

<template>
  <div :class="[tone === 'light' ? 'text-white' : 'text-[#343434]']">
    <!-- Feature bites with Material icons in neutral ink; no mint badges -->
    <ul class="space-y-3">
      <!-- 1 -->
      <li
        :class="[
          'group flex items-start gap-4 rounded-xl border-2 p-4 transition-colors duration-200',
          accent === 'sun'
            ? 'border-[#FFD808] bg-transparent hover:bg-[#343434] hover:text-[#FFD808]'
            : 'border-[rgba(52,52,52,0.25)] bg-transparent hover:bg-[#FFD808] hover:ring-1 hover:ring-[#343434]/10'
        ]"
      >
        <!-- Icon (pink) -->
        <span :class="['inline-flex h-8 w-8 flex-none items-center justify-center rounded-md', accent === 'sun' ? 'text-[#FFD808]' : 'text-pink-500']">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">bolt</span>
        </span>
        <!-- Copy -->
        <p :class="['mt-1 text-base leading-snug', accent === 'sun' ? 'text-[#FFD808]' : 'text-[#2F3061]']">
          <span class="font-semibold">Instant</span> LEGO-style color mapping
        </p>
      </li>

      <!-- 2 -->
      <li
        :class="[
          'group flex items-start gap-4 rounded-xl border-2 p-4 transition-colors duration-200',
          accent === 'sun' ? 'border-[#FFD808] bg-transparent hover:bg-[#343434] hover:text-[#FFD808]' : 'border-[rgba(52,52,52,0.25)] bg-transparent hover:bg-[#FFD808] hover:ring-1 hover:ring-[#343434]/10'
        ]"
      >
        <span :class="['inline-flex h-8 w-8 flex-none items-center justify-center rounded-md', accent === 'sun' ? 'text-[#FFD808]' : 'text-pink-500']">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">grid_view</span>
        </span>
        <p :class="['mt-1 text-base leading-snug', accent === 'sun' ? 'text-[#FFD808]' : 'text-[#2F3061]']">
          <span class="font-semibold">Greedy tiling</span> → fewer plates, cleaner look
        </p>
      </li>

      <!-- 3 -->
      <li
        :class="[
          'group flex items-start gap-4 rounded-xl border-2 p-4 transition-colors duration-200',
          accent === 'sun' ? 'border-[#FFD808] bg-transparent hover:bg-[#343434] hover:text-[#FFD808]' : 'border-[rgba(52,52,52,0.25)] bg-transparent hover:bg-[#FFD808] hover:ring-1 hover:ring-[#343434]/10'
        ]"
      >
        <span :class="['inline-flex h-8 w-8 flex-none items-center justify-center rounded-md', accent === 'sun' ? 'text-[#FFD808]' : 'text-pink-500']">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">receipt_long</span>
        </span>
        <p :class="['mt-1 text-base leading-snug', accent === 'sun' ? 'text-[#FFD808]' : 'text-[#2F3061]']">
          Auto <span class="font-semibold">Bill of Materials</span> + cost estimate
        </p>
      </li>

      <!-- 4 -->
      <li
        :class="[
          'group flex items-start gap-4 rounded-xl border-2 p-4 transition-colors duration-200',
          accent === 'sun' ? 'border-[#FFD808] bg-transparent hover:bg-[#343434] hover:text-[#FFD808]' : 'border-[rgba(52,52,52,0.25)] bg-transparent hover:bg-[#FFD808] hover:ring-1 hover:ring-[#343434]/10'
        ]"
      >
        <span :class="['inline-flex h-8 w-8 flex-none items-center justify-center rounded-md', accent === 'sun' ? 'text-[#FFD808]' : 'text-pink-500']">
          <span class="material-symbols-rounded text-[22px]" aria-hidden="true">download</span>
        </span>
        <p :class="['mt-1 text-base leading-snug', accent === 'sun' ? 'text-[#FFD808]' : 'text-[#2F3061]']">
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
        :variant="accent === 'sun' ? 'pinkSun' : 'pinkWhite'"
      />
    </div>
  </div>
</template>
