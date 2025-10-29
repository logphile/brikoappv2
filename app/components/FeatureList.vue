<script setup lang="ts">
import IconPalette from '@/components/icons/IconPalette.vue'
import IconLayers from '@/components/icons/IconLayers.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconPhoto from '@/components/icons/IconPhoto.vue'
import IconBolt from '@/components/icons/IconBolt.vue'
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Mosaic Engine -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconPalette class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">Mosaic Engine</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconLayers class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">3D Voxel Preview</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconReceipt class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">Smart BOM</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconDownload class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">Fast Exports</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconPhoto class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">Save &amp; Share</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            Keep your projects online and share them with friends
            <span class="text-pink-500">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="rounded-2xl ring-1 ring-black/10 shadow-card p-5 md:p-6 text-[#343434] transition hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <span class="inline-grid place-items-center h-9 w-9 rounded-xl
                         bg-[#2F3061] ring-1 ring-black/10 shadow-sm
                         transition-transform duration-150 hover:scale-[1.03] focus-visible:scale-[1.03]">
              <IconBolt class="h-5 w-5 text-[#FFD808]" />
            </span>
            <h3 class="text-[18px] font-semibold">Performance</h3>
          </div>
          <p class="mt-2 text-[17px]/[26px]">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
  </div>
</template>
