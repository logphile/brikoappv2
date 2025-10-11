<script setup lang="ts"></script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Mosaic Engine -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-grid-view-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">Mosaic Engine</h3>
          </div>
          <p class="mt-1 card-body">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-view-in-ar-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">3D Voxel Preview</h3>
          </div>
          <p class="mt-1 card-body">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-receipt-long-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">Smart BOM</h3>
          </div>
          <p class="mt-1 card-body">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-file-download-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">Fast Exports</h3>
          </div>
          <p class="mt-1 card-body">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-share-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">Save &amp; Share</h3>
          </div>
          <p class="mt-1 card-body">
            Keep your projects online and share them with friends
            <span class="text-pink-500">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="rounded-xl border border-brand-pink/40 bg-yellow-50/10 p-5 md:p-6 shadow-sm">
          <div class="flex items-center gap-2">
            <i-material-symbols-bolt-outline class="w-6 h-6 text-[#111827]/90" aria-hidden="true" />
            <h3 class="card-title">Performance</h3>
          </div>
          <p class="mt-1 card-body">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
  </div>
</template>
