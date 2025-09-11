<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { legoPalette } from '@/lib/palette/lego'

const props = defineProps<{ vox: { w:number; h:number; depth:number; colors: Uint8Array } }>()
const host = ref<HTMLDivElement|null>(null)

let renderer: any | null = null
let scene: any | null = null
let camera: any | null = null
let controls: any | null = null
let inst: any | null = null
let currentMesh: any | null = null
let animId = 0
let glCanvas: HTMLCanvasElement | null = null

// Layer clipping
const layer = ref(0) // 0..(depth-1); will be set to depth-1 after build
let plane: any | null = null

// Per-layer color legend data
let colorByLayer: Array<Record<string, number>> = []

function disposeScene () {
  if (animId) cancelAnimationFrame(animId)
  if (scene && inst) {
    scene.remove(inst)
    inst.geometry.dispose()
    ;(inst.material as any).dispose()
    inst = null
  }
  if (controls) { controls.dispose(); controls = null }
  if (renderer) {
    const dom = renderer.domElement
    if (dom && dom.parentElement) dom.parentElement.removeChild(dom)
    if (((window as any).__brikoCanvas) === dom) (window as any).__brikoCanvas = undefined
    renderer.dispose()
    renderer = null
    glCanvas = null
  }
  scene = null; camera = null
}

// View helpers
type ViewName = 'front' | 'iso' | 'top'
function setView(view: ViewName) {
  if (!camera || !controls || !currentMesh) return
  const box = new THREE.Box3().setFromObject(currentMesh)
  const size = new THREE.Vector3(); box.getSize(size)
  const center = new THREE.Vector3(); box.getCenter(center)

  const maxSize = Math.max(size.x, size.y, size.z)
  const fov = THREE.MathUtils.degToRad((camera as any).fov)
  const dist = ((maxSize / 2) / Math.tan(fov / 2)) * 1.2

  // Our voxel build extrudes along world Y, so the mosaic face is in XZ plane.
  // 'front' should position camera along +Y toward center. 'top' looks along +Z.
  let dir = new THREE.Vector3(0, 1, 0.001).normalize() // front (looking at +Y face)
  if (view === 'iso') dir = new THREE.Vector3(1, 0.75, 1).normalize()
  if (view === 'top') dir = new THREE.Vector3(0, 0, 1).normalize()

  camera.position.copy(center).add(dir.multiplyScalar(dist))
  camera.near = Math.max(0.1, dist / 100)
  camera.far  = dist * 100
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}

function fitCameraToObject (obj: any, padding = 1.25) {
  if (!camera || !controls) return
  const box = new THREE.Box3().setFromObject(obj)
  const size = new THREE.Vector3(); box.getSize(size)
  const center = new THREE.Vector3(); box.getCenter(center)

  const maxSize = Math.max(size.x, size.y, size.z)
  const fov = THREE.MathUtils.degToRad((camera as any).fov)
  let dist = (maxSize / 2) / Math.tan(fov / 2)
  dist *= padding

  camera.position.copy(center).add(new THREE.Vector3(dist, dist * 0.8, dist))
  camera.near = Math.max(0.1, dist / 100)
  camera.far = dist * 100
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}

function resize () {
  if (!renderer || !camera || !host.value) return
  const w = host.value.clientWidth || 1
  const h = 480
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

function build () {
  if (!host.value) return
  disposeScene()

  const { w, h, depth, colors } = props.vox
  const size = Math.max(w, h, depth)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = (THREE as any).SRGBColorSpace
  renderer.toneMapping = (THREE as any).ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearColor(0x0b0f16, 1)
  renderer.localClippingEnabled = true
  host.value.appendChild(renderer.domElement)
  glCanvas = renderer.domElement
  ;(window as any).__brikoCanvas = glCanvas

  // Scene + Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = true
  controls.enableZoom = true
  controls.autoRotate = false

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const dir1 = new THREE.DirectionalLight(0xffffff, 1.0); dir1.position.set(3,5,4); scene.add(dir1)
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.4); dir2.position.set(-4,2,-3); scene.add(dir2)
  // Key light attached to camera so the front face is readable
  scene.add(camera)
  const key = new THREE.DirectionalLight(0xffffff, 0.9)
  camera.add(key)

  // Instanced mesh
  const geo = new THREE.BoxGeometry(1,1,1)
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, roughness: 0.95 })
  inst = new (THREE as any).InstancedMesh(geo, mat, colors.length)

  let i = 0
  const m = new THREE.Matrix4()
  const c = new THREE.Color()
  // Reset color legends for this build
  colorByLayer = Array.from({ length: depth }, () => ({}))
  for (let z=0; z<depth; z++) {
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const ci = colors[(z*w*h) + (y*w + x)]
        if (ci === 255) continue // 255 sentinel = empty voxel
        const hex = legoPalette[ci]?.hex
        if (hex === undefined) continue
        m.makeTranslation(x - w/2, z, y - h/2)
        ;(inst as any).setMatrixAt(i, m)
        c.set(hex)
        ;(inst as any).setColorAt(i, c)
        // Tally per-layer color counts (by hex)
        const rec = colorByLayer[z]
        rec[hex] = (rec[hex] ?? 0) + 1
        i++
      }
    }
  }
  ;(inst as any).count = i
  ;(inst as any).instanceMatrix.needsUpdate = true
  ;(inst as any).instanceColor && ((inst as any).instanceColor.needsUpdate = true)
  ;(inst as any).frustumCulled = false
  scene.add(inst)
  currentMesh = inst

  // Ground/grid (optional)
  const grid = new THREE.GridHelper(size, size, 0x444444, 0x222222)
  ;(grid as any).rotation.x = Math.PI / 2
  scene.add(grid)

  // Clipping plane to reveal layers [0..k]; world Y is our depth axis (z-index)
  plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
  renderer.clippingPlanes = [plane]

  // Fit and size
  resize()
  fitCameraToObject(inst, 1.35)
  // Default to a front-facing view for recognizability
  setView('front')
  // Initialize slider to show all layers by default
  layer.value = Math.max(0, depth - 1)
  if (plane) plane.constant = layer.value
  window.addEventListener('resize', resize, { passive: true })

  // Render loop
  const tick = () => {
    controls && controls.update()
    renderer && scene && camera && renderer.render(scene, camera)
    animId = requestAnimationFrame(tick)
  }
  tick()
}

onMounted(async () => { await nextTick(); resize(); })
onMounted(build)
watch(() => props.vox, async () => { await nextTick(); build() })
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  disposeScene()
})

// Layer control bindings
watch(layer, (k) => {
  if (!renderer || !plane) return
  plane.constant = k
  // keep controls target at content center to prevent drift
  if (currentMesh && controls) {
    const box = new THREE.Box3().setFromObject(currentMesh)
    const center = new THREE.Vector3(); box.getCenter(center)
    controls.target.copy(center)
    controls.update()
  }
})

// Expose quick view methods to parent + internals for PDF export
function toFront(){ setView('front') }
function toIso(){ setView('iso') }
function toTop(){ setView('top') }
function getCountsForLayer(k:number){
  const acc: Record<string, number> = {}
  const max = Math.min(k, colorByLayer.length - 1)
  for (let i = 0; i <= max; i++) {
    const rec = colorByLayer[i]
    for (const hex in rec) acc[hex] = (acc[hex] ?? 0) + rec[hex]
  }
  return acc
}
defineExpose({ setView, toFront, toIso, toTop, renderer, scene, camera, depth: () => props.vox.depth, setLayer: (k:number) => { layer.value = k }, getCountsForLayer })
</script>

<template>
  <div>
    <div ref="host" class="w-full h-[480px] rounded-xl bg-black/20"></div>
    <div v-if="vox" class="mt-2">
      <label class="block text-sm mb-1">Layer</label>
      <input type="range" min="0" :max="vox.depth - 1" v-model.number="layer" class="w-full range-mint" />
      <div class="text-xs text-white/60">Showing layers 0–{{ layer }}</div>
    </div>
  </div>
  </template>
