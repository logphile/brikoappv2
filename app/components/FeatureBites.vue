<script setup lang="ts"></script>

<template>
  <div class="text-[#343434]">
    <!-- Feature bites with icons, mint accents, and hover polish -->
    <ul class="space-y-3">
      <!-- 1 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-[#00E5A0]/30 hover:bg-white/[0.07]"
      >
        <!-- Icon -->
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full
                     bg-[#00E5A0]/15 text-[#343434] ring-1 ring-[#00E5A0]/20">
          <span class="material-symbols-rounded text-[20px]" aria-hidden="true">bolt</span>
        </span>
        <!-- Copy -->
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Instant</span> LEGO-style color mapping
          <span class="ml-1 inline-block rounded-full bg-[#00E5A0]/10 px-2 py-0.5 text-xs text-[#343434]">
            wow moment
          </span>
        </p>
      </li>

      <!-- 2 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-[#00E5A0]/30 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full
                     bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/20">
          <span class="material-symbols-rounded text-[20px]" aria-hidden="true">layers</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Greedy tiling</span> → fewer plates, cleaner look
        </p>
      </li>

      <!-- 3 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-[#00E5A0]/30 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full
                     bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/20">
          <span class="material-symbols-rounded text-[20px]" aria-hidden="true">inventory_2</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          Auto <span class="font-semibold">Bill of Materials</span> + cost estimate
        </p>
      </li>

      <!-- 4 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-[#00E5A0]/30 hover:bg-white/[0.07]"
      >
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full
                     bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/20">
          <span class="material-symbols-rounded text-[20px]" aria-hidden="true">file_download</span>
        </span>
        <p class="mt-1 text-base leading-snug">
          One-click exports: <span class="font-semibold">PNG · CSV · PDF</span>
        </p>
      </li>
    </ul>

    <!-- Trust badges / stats row (equal width, fills the column) -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      <!-- Badge 1 -->
      <div
        class="flex items-center justify-center gap-2 rounded-full bg-white/5
               py-2.5 px-4 text-sm text-[#343434] ring-1 ring-white/10
               hover:ring-[#00E5A0]/30 transition min-h-[44px]"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-[#00E5A0]" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1-4-2V7Z"/>
        </svg>
        <span class="whitespace-nowrap">&lt; 2s preview</span>
      </div>

      <!-- Badge 2 -->
      <div
        class="flex items-center justify-center gap-2 rounded-full bg-white/5
               py-2.5 px-4 text-sm text-[#343434] ring-1 ring-white/10
               hover:ring-[#00E5A0]/30 transition min-h-[44px]"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-[#00E5A0]" fill="currentColor" aria-hidden="true">
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/>
        </svg>
        <span class="whitespace-nowrap">Free to try</span>
      </div>

      <!-- Badge 3 -->
      <div
        class="flex items-center justify-center gap-2 rounded-full bg-white/5
               py-2.5 px-4 text-sm text-[#343434] ring-1 ring-white/10
               hover:ring-[#00E5A0]/30 transition min-h-[44px]"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-[#00E5A0]" fill="currentColor" aria-hidden="true">
          <path d="M12 2 1 7l11 5 9-4.1V17h2V7L12 2Z"/>
        </svg>
        <span class="whitespace-nowrap">No signup required</span>
      </div>
    </div>
  </div>
</template>
