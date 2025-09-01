<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { WorkerOut, Placement } from '@/types/mosaic'
const props = defineProps<{
  data: WorkerOut
  stepItems: Placement[]
  showGrid?: boolean
}>()
const cvs = ref<HTMLCanvasElement|null>(null)

function render(){
  if(!cvs.value) return
  const { width, height, palette } = props.data
  const scale = Math.max(2, Math.floor(512/Math.max(width,height)))
  cvs.value.width  = width*scale
  cvs.value.height = height*scale
  const ctx = cvs.value.getContext('2d')!
  ctx.clearRect(0,0,cvs.value.width,cvs.value.height)

  // faint backdrop (optional)
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  ctx.fillRect(0,0,cvs.value.width,cvs.value.height)

  // draw only placements for this step
  for(const t of props.stepItems){
    ctx.fillStyle = palette[t.color].hex
    ctx.fillRect(t.x*scale, t.y*scale, t.w*scale, t.h*scale)
    if(props.showGrid && scale>=6){
      ctx.strokeStyle = 'rgba(0,0,0,.15)'
      ctx.strokeRect(t.x*scale+.5, t.y*scale+.5, t.w*scale-1, t.h*scale-1)
    }
    // outline
    ctx.lineWidth = Math.max(1, Math.floor(scale/6))
    ctx.strokeStyle = 'rgba(255,255,255,.35)'
    ctx.strokeRect(t.x*scale+.5, t.y*scale+.5, t.w*scale-1, t.h*scale-1)
  }
}
onMounted(render); watch(()=>props, render, {deep:true})
</script>
<template><canvas ref="cvs" class="w-full rounded-xl bg-black/20"></canvas></template>
