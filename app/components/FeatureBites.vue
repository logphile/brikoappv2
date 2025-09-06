<script setup lang="ts"></script>

<template>
  <div class="text-white">
    <!-- Feature bites with icons, mint accents, and hover polish -->
    <ul class="space-y-3">
      <!-- 1 -->
      <li
        class="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5
               p-4 transition hover:border-[#00E5A0]/30 hover:bg-white/[0.07]"
      >
        <!-- Icon -->
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full
                     bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/20">
          <!-- Bolt -->
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>
          </svg>
        </span>
        <!-- Copy -->
        <p class="mt-1 text-base leading-snug">
          <span class="font-semibold">Instant</span> LEGO-style color mapping
          <span class="ml-1 inline-block rounded-full bg-[#00E5A0]/10 px-2 py-0.5 text-xs text-[#00E5A0]">
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
          <!-- Layers -->
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v3l10 5 10-5V4l-10 5Zm0 5L2 9v3l10 5 10-5V9l-10 5Z"/>
          </svg>
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
          <!-- Receipt -->
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path d="M7 2h10l2 2v18l-3-2-3 2-3-2-3 2V2Zm3 6h6v2h-6V8Zm0 4h6v2h-6v-2Zm-3-4h2v2H7V8Zm0 4h2v2H7v-2Z"/>
          </svg>
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
          <!-- Download -->
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path d="M12 3v10l4-4 1 1-6 6-6-6 1-1 4 4V3h2Zm-7 15h14v2H5v-2Z"/>
          </svg>
        </span>
        <p class="mt-1 text-base leading-snug">
          One-click exports: <span class="font-semibold">PNG · CSV · PDF</span>
        </p>
      </li>
    </ul>

    <!-- Micro-badges / trust row -->
    <div class="mt-5 flex flex-wrap items-center gap-2">
      <span class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-300 ring-1 ring-white/10">
        <!-- Clock -->
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-[#00E5A0]" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1-4-2V7Z"/>
        </svg>
        <span>&lt; 2s preview</span>
      </span>
      <span class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-300 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-[#00E5A0]" fill="currentColor">
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/>
        </svg>
        <span>Free to try</span>
      </span>
      <span class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-300 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-[#00E5A0]" fill="currentColor">
          <path d="M12 2 1 7l11 5 9-4.1V17h2V7L12 2Z"/>
        </svg>
        <span>No signup required</span>
      </span>
    </div>
  </div>
</template>
