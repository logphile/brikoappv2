<script setup lang="ts"></script>

<template>
  <section class="bg-transparent text-[#343434]">
    <div class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <SectionHeader
        title="Briko’s Geeky Superpowers"
        subtitle="Smart color maps, cleaner tiling, instant exports."
      />
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Mosaic Engine -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">grid_view</span>
            <h3 class="text-lg font-semibold">Mosaic Engine</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">view_in_ar</span>
            <h3 class="text-lg font-semibold">3D Voxel Preview</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">receipt_long</span>
            <h3 class="text-lg font-semibold">Smart BOM</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">download</span>
            <h3 class="text-lg font-semibold">Fast Exports</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">share</span>
            <h3 class="text-lg font-semibold">Save &amp; Share</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            Keep your projects online and share them with friends
            <span class="text-pink-500">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-rounded text-[24px] text-[#111827]/90">bolt</span>
            <h3 class="text-lg font-semibold">Performance</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#343434]">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
