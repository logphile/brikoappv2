<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { homeIcons } from '@/components/icons/homeIcons'
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Mosaic Engine -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.mosaic" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">Mosaic Engine</h3>
          </div>
          <p class="mt-2 text-[15px]">
            Turn any photo into a colorful brick mosaic in seconds.
          </p>
        </article>

        <!-- 3D Voxel Preview -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.voxel" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">3D Voxel Preview</h3>
          </div>
          <p class="mt-2 text-[15px]">
            See your build in 3D — rotate, zoom, and step through layers.
          </p>
        </article>

        <!-- Smart BOM -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.bom" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">Smart BOM</h3>
          </div>
          <p class="mt-2 text-[15px]">
            Get an instant parts list with sizes and counts, ready to order.
          </p>
        </article>

        <!-- Fast Exports -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.export" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">Fast Exports</h3>
          </div>
          <p class="mt-2 text-[15px]">
            Download your build steps as PNG, CSV, or PDF with one click.
          </p>
        </article>

        <!-- Save & Share -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.save" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">Save &amp; Share</h3>
          </div>
          <p class="mt-2 text-[15px]">
            Keep your projects online and share them with friends
            <span class="text-pink-500">(coming soon)</span>.
          </p>
        </article>

        <!-- Performance -->
        <article class="soft-card border p-5 md:p-6 border-[#000]/10 bg-white/30 text-[#343434]">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-8 w-8 rounded-lg bg-[#FFD808] ring-1 ring-black/10 items-center justify-center">
              <Icon :icon="homeIcons.features.perf" width="18" height="18" class="text-[#2F3061]" />
            </span>
            <h3 class="text-[18px] font-semibold">Performance</h3>
          </div>
          <p class="mt-2 text-[15px]">
            Smooth and instant — mosaics and 3D models render in under 2 seconds.
          </p>
        </article>
  </div>
</template>
