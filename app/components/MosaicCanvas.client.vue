<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { WorkerOut, Placement, BOMRow } from '@/types/mosaic'
import PlateTooltip from '@/components/ui/PlateTooltip.vue'
// Local shape for streaming overlay bricks
interface TiledBrick { x:number; y:number; w:number; h:number; colorId:number }
const props = defineProps<{ data: WorkerOut, showGrid?: boolean, showTiles?: boolean, overlayBricks?: TiledBrick[], tileMap?: Uint32Array | null, bricks?: TiledBrick[] | null, bomRows?: BOMRow[] | null, surface?: 'plates'|'tiles' }>()
const emit = defineEmits<{(e:'view-bom', payload:{ part: string, colorId: number }): void}>()
const cvs = ref<HTMLCanvasElement|null>(null)
const ov = ref<HTMLCanvasElement|null>(null)
const wrapper = ref<HTMLDivElement|null>(null)

// Part numbers for plates
const PART_NO: Record<string,string> = { '2x4':'3020', '2x3':'3021', '2x2':'3022', '1x4':'3710', '1x3':'3623', '1x2':'3023', '1x1':'3024' }

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
  // tile outlines when provided (legacy placements)
  if(props.showTiles && props.data.placements){
    ctx.lineWidth = Math.max(1, Math.floor(scale/6))
    ctx.strokeStyle = 'rgba(255,255,255,.12)'
    for(const t of props.data.placements as Placement[]){
      if (t.w>1 || t.h>1) ctx.strokeRect(t.x*scale+.5, t.y*scale+.5, t.w*scale-1, t.h*scale-1)
    }
  }
  // streaming or final overlay from tiler (new)
  if(props.showTiles && props.overlayBricks && props.overlayBricks.length){
    ctx.lineWidth = Math.max(1, Math.floor(scale/6))
    ctx.strokeStyle = 'rgba(255,255,255,.12)'
    for(const t of props.overlayBricks as TiledBrick[]){
      if (t.w>1 || t.h>1) ctx.strokeRect(t.x*scale+.5, t.y*scale+.5, t.w*scale-1, t.h*scale-1)
    }
  }
  // save canvas globally for PNG export
  ;(window as any).__brikoCanvas = cvs.value
  // Reset overlay dim to match
  if (ov.value) { ov.value.width = cvs.value.width; ov.value.height = cvs.value.height; clearOverlay() }
}

function clearOverlay(){ if (!ov.value) return; const c = ov.value.getContext('2d')!; c.clearRect(0,0,ov.value.width, ov.value.height) }

const hover = ref<{ id: number; x: number; y: number; w: number; h: number } | null>(null)
const tooltip = ref<{ x: number; y: number } | null>(null)

function drawHoverRect(rect: {x:number;y:number;w:number;h:number}){
  if(!ov.value || !cvs.value) return
  clearOverlay()
  const { width, height } = props.data
  const scale = cvs.value.width / width
  const ctx = ov.value.getContext('2d')!
  ctx.save()
  const dpr = (globalThis.devicePixelRatio || 1)
  ctx.lineWidth = dpr
  ctx.strokeStyle = '#00E5A0'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 4 * dpr
  ctx.strokeRect(rect.x*scale+.5, rect.y*scale+.5, rect.w*scale-1, rect.h*scale-1)
  ctx.restore()
}

function posToTile(ev: PointerEvent){
  if(!cvs.value) return null
  const rect = cvs.value.getBoundingClientRect()
  const { width, height } = props.data
  const px = rect.width / width
  const py = rect.height / height
  const tx = Math.floor((ev.clientX - rect.left) / px)
  const ty = Math.floor((ev.clientY - rect.top) / py)
  if (tx < 0 || ty < 0 || tx >= width || ty >= height) return null
  return { x: tx, y: ty }
}

function handleMove(ev: PointerEvent){
  if (!props.tileMap || !props.bricks) return
  const t = posToTile(ev); if (!t) { hover.value = null; tooltip.value = null; clearOverlay(); return }
  const { width } = props.data
  const id = props.tileMap[t.y * width + t.x]
  if (!id) { if (hover.value){ hover.value = null; tooltip.value = null; clearOverlay() }; return }
  const b = props.bricks[id - 1]
  if (!b) { hover.value = null; tooltip.value = null; clearOverlay(); return }
  const changed = !hover.value || hover.value.id !== id
  hover.value = { id, x: b.x, y: b.y, w: b.w, h: b.h }
  tooltip.value = { x: ev.clientX, y: ev.clientY }
  if (changed) drawHoverRect(b)
}

function handleLeave(){ hover.value = null; tooltip.value = null; clearOverlay() }

function handleTooltipClose(){ hover.value = null; tooltip.value = null; clearOverlay() }

let touchTimer: number | undefined
function handleTouchStart(ev: TouchEvent){
  if (!props.tileMap || !props.bricks || !cvs.value) return
  const t = ev.touches && ev.touches[0]
  if (!t) return
  const rect = cvs.value.getBoundingClientRect()
  const { width, height } = props.data
  const px = rect.width / width
  const py = rect.height / height
  const tx = Math.floor((t.clientX - rect.left) / px)
  const ty = Math.floor((t.clientY - rect.top) / py)
  if (tx < 0 || ty < 0 || tx >= width || ty >= height) { handleLeave(); return }
  const id = props.tileMap[ty * width + tx]
  if (!id) { handleLeave(); return }
  const b = props.bricks[id - 1]
  if (!b) { handleLeave(); return }
  hover.value = { id, x: b.x, y: b.y, w: b.w, h: b.h }
  tooltip.value = { x: t.clientX, y: t.clientY }
  drawHoverRect(b)
  if (touchTimer) clearTimeout(touchTimer)
  touchTimer = window.setTimeout(() => { handleLeave() }, 1500)
}

const spec = computed(() => {
  if (!hover.value || !props.bricks) return null
  const b = props.bricks[hover.value.id - 1]
  const part = `${b.w}x${b.h}`
  const pn = PART_NO[part] || '—'
  const color = props.data.palette[b.colorId]
  const bom = props.bomRows || []
  const row = bom.find(r => r.part === part && r.colorId === b.colorId)
  const qty = row?.qty || 0
  return { part, pn, colorName: color?.name || `Color ${b.colorId}`, colorHex: color?.hex || '#ccc', qty, colorId: b.colorId }
})

function viewInParts(){
  if (!spec.value) return
  emit('view-bom', { part: spec.value.part, colorId: spec.value.colorId })
}

onMounted(render); watch(()=>[props.data, props.showGrid, props.showTiles, props.overlayBricks?.length], render, {deep:true})
watch(() => props.tileMap, () => { clearOverlay(); hover.value = null; tooltip.value = null })
</script>
<template>
  <div ref="wrapper" class="relative">
    <canvas ref="cvs" class="w-full rounded-xl bg-black/20 block"></canvas>
    <!-- hover overlay canvas -->
    <canvas ref="ov" class="pointer-events-none absolute inset-0 w-full h-full rounded-xl"></canvas>
    <!-- tooltip -->
    <PlateTooltip
      v-if="hover && spec && tooltip"
      :show="true"
      :x="tooltip.x"
      :y="tooltip.y"
      :part="{
        brick: `${(props.surface==='tiles' ? 'Tile' : 'Plate')} ${spec.part.replace('x','×')} (${spec.pn})`,
        color: spec.colorName,
        count: spec.qty,
        link: '#parts-list'
      }"
      @close="handleTooltipClose"
    />
    <!-- event capture on wrapper -->
    <div class="absolute inset-0" @pointermove.passive="handleMove" @pointerleave.passive="handleLeave" @touchstart.passive="handleTouchStart"></div>
  </div>
</template>

