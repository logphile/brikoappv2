<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { WorkerOut, Placement } from '@/types/mosaic'
const props = defineProps<{ data: WorkerOut, showGrid?: boolean, showTiles?: boolean }>()
const cvs = ref<HTMLCanvasElement|null>(null)

function render(){
  if(!cvs.value) return
  const { width, height, palette, indexes } = props.data
  const scale = Math.max(2, Math.floor(512/Math.max(width,height)))
  cvs.value.width  = width*scale
  cvs.value.height = height*scale
  const ctx = cvs.value.getContext('2d')!
  ctx.clearRect(0,0,cvs.value.width,cvs.value.height)
  for(let y=0,i=0;y<height;y++){
    for(let x=0;x<width;x++,i++){
      const p = palette[indexes[i]]
      ctx.fillStyle = p.hex
      ctx.fillRect(x*scale, y*scale, scale, scale)
      if(props.showGrid && scale>=6){
        ctx.strokeStyle = 'rgba(0,0,0,.15)'
        ctx.strokeRect(x*scale+.5, y*scale+.5, scale-1, scale-1)
      }
    }
  }
  // tile outlines when provided
  if(props.showTiles && props.data.placements){
    ctx.lineWidth = Math.max(1, Math.floor(scale/6))
    ctx.strokeStyle = 'rgba(255,255,255,.6)'
    for(const t of props.data.placements as Placement[]){
      ctx.strokeRect(t.x*scale+.5, t.y*scale+.5, t.w*scale-1, t.h*scale-1)
    }
  }
  // save canvas globally for PNG export
  ;(window as any).__brikoCanvas = cvs.value
}
onMounted(render); watch(()=>[props.data, props.showGrid, props.showTiles], render, {deep:true})
</script>
<template><canvas ref="cvs" class="w-full rounded-xl bg-black/20"></canvas></template>
