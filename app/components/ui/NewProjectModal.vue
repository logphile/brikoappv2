<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        id="new-project-modal"
        class="fixed inset-0 z-[100] grid place-items-center p-4"
        role="dialog" aria-modal="true"
        @keydown.esc="$emit('update:open', false)"
      >
        <!-- Background dim -->
        <div class="absolute inset-0 bg-black/40" @click="$emit('update:open', false)" />

        <!-- Panel -->
        <div
          class="relative z-10 w-full max-w-lg md:max-w-xl rounded-2xl
                 bg-[rgb(17,24,39)]/95 text-white
                 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.6)]
                 border border-white/10 backdrop-blur
                 p-6"
        >
          <!-- Header -->
          <div class="mb-5">
            <div class="inline-flex items-center gap-2 rounded-xl
                        bg-[#FF0062]/15 text-white px-3 py-1
                        ring-1 ring-[#FF0062]/30">
              <span class="h-2 w-2 rounded-full bg-[#FF0062]"></span>
              <span class="text-xs font-semibold tracking-wide">New Project</span>
            </div>
            <h2 class="mt-3 text-2xl font-semibold text-white">Start a new project</h2>
            <p class="text-sm text-white/70">Pick a generator to begin.</p>
          </div>

          <!-- Choices -->
          <div class="grid gap-3">
            <NuxtLink
              to="/photo"
              class="group block rounded-xl p-4
                     bg-white/5 hover:bg-white/8
                     ring-1 ring-white/10 hover:ring-[#FF0062]/40
                     transition-all cursor-pointer focus:outline-none
                     focus:ring-2 focus:ring-[#FF0062]/60"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-base font-semibold text-white">Mosaic (Photo → Bricks)</div>
                  <div class="mt-0.5 text-[15px] text-white/70">LEGO-style color map, greedy tiling, BOM.</div>
                </div>
                <span class="mt-1 opacity-0 group-hover:opacity-100 transition
                              inline-flex h-6 w-6 items-center justify-center rounded-full
                              bg-[#FF0062]/20 ring-1 ring-[#FF0062]/40">→</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/voxel"
              class="group block rounded-xl p-4
                     bg-white/5 hover:bg-white/8
                     ring-1 ring-white/10 hover:ring-[#FF0062]/40
                     transition-all cursor-pointer focus:outline-none
                     focus:ring-2 focus:ring-[#FF0062]/60"
            >
              <div class="text-base font-semibold text-white">3D Voxel Builder</div>
              <div class="mt-0.5 text-[15px] text-white/70">Live 3D preview with instanced bricks.</div>
            </NuxtLink>

            <NuxtLink
              to="/avatar"
              class="group block rounded-xl p-4
                     bg-white/5 hover:bg-white/8
                     ring-1 ring-white/10 hover:ring-[#FF0062]/40
                     transition-all cursor-pointer focus:outline-none
                     focus:ring-2 focus:ring-[#FF0062]/60"
            >
              <div class="text-base font-semibold text-white">Avatar (LEGO-style)</div>
              <div class="mt-0.5 text-[15px] text-white/70">Quick face filter—fun & sharable.</div>
            </NuxtLink>
          </div>

          <!-- Footer -->
          <div class="mt-6 flex justify-end">
            <button
              class="inline-flex h-10 items-center justify-center rounded-xl px-4
                     bg-[#FF0062] text-white font-medium shadow
                     hover:brightness-110 active:brightness-95
                     focus:outline-none focus:ring-2 focus:ring-white/40"
              @click="$emit('update:open', false)"
            >
              Close
            </button>
          </div>

          <!-- soft mint glow -->
          <div class="pointer-events-none absolute -inset-px rounded-2xl
                      ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
                      after:absolute after:inset-0 after:rounded-2xl
                      after:shadow-[0_0_60px_10px_rgba(255,0,98,0.10)]"></div>
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
