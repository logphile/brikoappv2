<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" id="new-project-modal" class="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" @keydown.esc="$emit('update:open', false)">
        <!-- overlay UNDER panel -->
        <div class="absolute inset-0 bg-black/50 pointer-events-auto" @click="$emit('update:open', false)" />

        <!-- panel ABOVE overlay -->
        <div class="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] shadow-xl border border-white/10 p-6">
          <div class="mb-4">
            <h2 class="text-2xl font-semibold text-[#343434]">Start a new project</h2>
            <p class="text-sm text-[#343434]/70">Pick a generator to begin.</p>
          </div>

          <div class="grid gap-3">
            <NuxtLink to="/photo" class="block rounded-xl ring-1 ring-black/10 p-4 hover:bg-black/5 cursor-pointer">
              <div class="text-lg font-medium text-[#343434]">Mosaic (Photo → Bricks)</div>
              <div class="text-sm text-[#343434]/70">LEGO-style color map, greedy tiling, BOM.</div>
            </NuxtLink>

            <NuxtLink to="/voxel" class="block rounded-xl ring-1 ring-black/10 p-4 hover:bg-black/5 cursor-pointer">
              <div class="text-lg font-medium text-[#343434]">3D Voxel Builder</div>
              <div class="text-sm text-[#343434]/70">Live 3D preview with instanced bricks.</div>
            </NuxtLink>

            <NuxtLink to="/avatar" class="block rounded-xl ring-1 ring-black/10 p-4 hover:bg-black/5 cursor-pointer">
              <div class="text-lg font-medium text-[#343434]">Avatar (LEGO-style)</div>
              <div class="text-sm text-[#343434]/70">Quick face filter—fun & sharable.</div>
            </NuxtLink>
          </div>

          <div class="mt-6 flex justify-end">
            <button class="h-10 px-4 rounded-xl ring-1 ring-black/10 hover:bg-black/5 cursor-pointer" @click="$emit('update:open', false)">Close</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits(['update:open'])
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .15s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
