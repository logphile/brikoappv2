<script setup lang="ts">
import { ref } from 'vue'
import StepHeader from './StepHeader.vue'
import ActiveColorStrip from './ActiveColorStrip.vue'
import LegendCompass from './LegendCompass.vue'

defineProps<{
  step: number
  placedNow: number
  totalPlaced: number
  activeColors: Array<{hex:string; name?:string; count:number}>
}>()

const canvasRef = ref<HTMLCanvasElement|null>(null)
// Exporter will snapshot this container and draw on canvasRef as needed
defineExpose({ canvasRef })
</script>

<template>
  <section class="grid grid-cols-[1fr_260px] gap-6">
    <div class="flex flex-col gap-4">
      <StepHeader :step="step" :placedNow="placedNow" :totalPlaced="totalPlaced" />
      <div class="rounded-2xl border border-[#2F3061]/30 bg-white p-2">
        <canvas ref="canvasRef" class="w-full h-auto rounded-xl bg-[#F5F4F1]"></canvas>
      </div>
      <LegendCompass />
    </div>
    <ActiveColorStrip :rows="activeColors" />
  </section>
</template>
