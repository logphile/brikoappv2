<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
const props = defineProps<{ vox: { w:number; h:number; depth:number; colors: Uint8Array } }>()
const host = ref<HTMLDivElement|null>(null)
let renderer: any | null = null
let scene: any | null = null
let camera: any | null = null
let inst: any | null = null
let animId = 0
let glCanvas: HTMLCanvasElement | null = null

const PALETTE = ['#1B1B1B','#6D6E6E','#A3A3A3','#F4F4F4','#C91A09','#F2CD37','#FE8A18','#2DD4BF']

function disposeScene(){
  if(animId) cancelAnimationFrame(animId)
  if(inst){ inst.geometry.dispose(); (inst.material as any).dispose(); inst = null }
  if(renderer){
    const dom = renderer.domElement
    renderer.dispose()
    if(dom.parentElement) dom.parentElement.removeChild(dom)
    if(((window as any).__brikoCanvas) === dom){ (window as any).__brikoCanvas = undefined }
    renderer=null
    glCanvas = null
  }
  scene = null; camera = null
}

function build(){
  if(!host.value) return
  disposeScene()
  const { w, h, depth, colors } = props.vox
  const size = Math.max(w, h, depth)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(host.value.clientWidth, 480)
  host.value.appendChild(renderer.domElement)
  glCanvas = renderer.domElement
  ;(window as any).__brikoCanvas = glCanvas

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, host.value.clientWidth/480, 0.1, 2000)
  camera.position.set(size*0.9, size*0.9, size*1.2)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1,2,3); scene.add(light)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  const geo = new THREE.BoxGeometry(1,1,1)
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true })
  inst = new THREE.InstancedMesh(geo, mat, colors.length)

  let i = 0
  const m = new THREE.Matrix4()
  const color = new THREE.Color()
  for (let z=0; z<depth; z++){
    for (let y=0; y<h; y++){
      for (let x=0; x<w; x++){
        const c = colors[(z*w*h) + (y*w + x)]
        if (!c) continue
        m.makeTranslation(x - w/2, z, y - h/2)
        inst.setMatrixAt(i, m)
        color.set(PALETTE[c])
        ;(inst as any).setColorAt(i, color)
        i++
      }
    }
  }
  inst.count = i
  inst.instanceMatrix.needsUpdate = true
  ;(inst as any).instanceColor && ((inst as any).instanceColor.needsUpdate = true)
  scene.add(inst)

  const grid = new THREE.GridHelper(size, size, 0x444444, 0x222222)
  grid.rotation.x = Math.PI/2; scene.add(grid)

  const loop = ()=>{ animId = requestAnimationFrame(loop); if(renderer && scene && camera) renderer.render(scene, camera) }
  loop()
}

onMounted(build)
watch(()=>props.vox, ()=>{ build() })
onBeforeUnmount(disposeScene)
</script>

<template><div ref="host" class="w-full h-[480px] rounded-xl bg-black/20"></div></template>
