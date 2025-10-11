<script setup lang="ts"></script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Mosaic Engine -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:grid-view-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Mosaic Engine</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:view-in-ar-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">3D Voxel Preview</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:receipt-long-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Smart BOM</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:file-download-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Fast Exports</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:share-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Save &amp; Share</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            Keep your projects online and share them with friends
            <span class="text-pink-500">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="rounded-2xl border border-[#FF0062] bg-white/5 p-5 ring-1 ring-[#FF0062] cursor-default select-none">
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:bolt-outline" class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Performance</h3>
          </div>
          <span aria-hidden="true" class="mt-2 block h-1 w-10 bg-pink-500"></span>
          <p class="mt-2 text-sm text-[#2F3061]">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
  </div>
</template>
