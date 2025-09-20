<script setup lang="ts"></script>

<template>
  <section class="bg-[#0B1220] text-white">
    <div class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <h2 class="h-section-46 text-center mb-8">
        Briko’s Geeky Superpowers
      </h2>
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Mosaic Engine -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- image icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="14" rx="2" ry="2"/>
                <circle cx="8.5" cy="9.5" r="1.5"/>
                <path d="M21 15l-6-6L5 19"/>
              </svg>
            </span>
            <h3 class="text-lg font-semibold">Mosaic Engine</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- cube icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <path d="M3.27 6.96L12 12l8.73-5.04"/>
                <path d="M12 22V12"/>
              </svg>
            </span>
            <h3 class="text-lg font-semibold">3D Voxel Preview</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- list icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>
                <circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>
              </svg>
            </span>
            <h3 class="text-lg font-semibold">Smart BOM</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- download icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
            </span>
            <h3 class="text-lg font-semibold">Fast Exports</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- share-2 icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98"/>
                <path d="M15.41 6.51l-6.82 3.98"/>
              </svg>
            </span>
            <h3 class="text-lg font-semibold">Save &amp; Share</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Keep your projects online and share them with friends
            <span class="text-gray-400">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-[#00E5A0]/[0.07] hover:to-[#00E5A0]/[0.12]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25 shadow-mint-glow">
              <!-- zap icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <h3 class="text-lg font-semibold">Performance</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
