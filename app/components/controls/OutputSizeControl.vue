<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm">Output size (studs)</label>
      <div class="chip-group" role="tablist" aria-label="Output size (studs)">
        <button
          v-for="p in presetsComputed"
          :key="p.label"
          :class="['chip', (width===p.w && height===p.h) && 'chip--active']"
          role="tab"
          :aria-selected="width===p.w && height===p.h"
          @click.prevent="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <label class="text-sm block">
        <span class="block opacity-80">Width</span>
        <input type="number" min="8" max="256" step="1" class="mt-1 w-full rounded-xl border border-white/20 bg-white/70 text-gray-900 px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-[color:var(--purple)]"
               :value="width" @input="$emit('update:width', toNum(($event.target as HTMLInputElement).value, width))" />
      </label>
      <label class="text-sm block">
        <span class="block opacity-80">Height</span>
        <input type="number" min="8" max="256" step="1" class="mt-1 w-full rounded-xl border border-white/20 bg-white/70 text-gray-900 px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-[color:var(--purple)]"
               :value="height" @input="$emit('update:height', toNum(($event.target as HTMLInputElement).value, height))" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  width: number
  height: number
  presets?: Array<{ w:number; h:number; label:string }>
}>()
const emit = defineEmits<{ (e:'update:width', v:number): void; (e:'update:height', v:number): void }>()

const presetsComputed = computed(() => props.presets && props.presets.length
  ? props.presets
  : [
      { w:16, h:16, label:'16×16' },
      { w:20, h:20, label:'20×20' },
      { w:32, h:32, label:'32×32' },
      { w:48, h:48, label:'48×48' },
      { w:64, h:64, label:'64×64' },
    ])

function applyPreset(p:{w:number;h:number}){
  emit('update:width', p.w)
  emit('update:height', p.h)
}
function toNum(v:string, fallback:number){ const n = Number(v); return Number.isFinite(n) ? n : fallback }
</script>
