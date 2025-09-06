<script setup lang="ts"></script>

<template>
  <section class="bg-[#0B1220] text-white">
    <div class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <h2 class="text-center text-2xl sm:text-3xl font-bold mb-8">
        Briko’s Geeky Superpowers
      </h2>
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Mosaic Engine -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
            <h3 class="text-lg font-semibold">Mosaic Engine</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
            <h3 class="text-lg font-semibold">3D Voxel Preview</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
            <h3 class="text-lg font-semibold">Smart BOM</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
            <h3 class="text-lg font-semibold">Fast Exports</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
            <h3 class="text-lg font-semibold">Save &amp; Share</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-[#00E5A0]/90 transition-[width] duration-200 group-hover:w-16"></span>
          <p class="mt-2 text-sm text-gray-300">
            Keep your projects online and share them with friends
            <span class="text-gray-400">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00E5A0]/[0.04] hover:to-[#00E5A0]/[0.08]
                       p-5 ring-1 ring-white/10 hover:ring-[#00E5A0]/30 focus-within:ring-[#00E5A0]/40
                       transform-gpu transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-2xl">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#00E5A0]"></span>
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
