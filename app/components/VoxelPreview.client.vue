<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { legoPalette } from '@/lib/palette/lego'
import type { BuildMode } from '@/types/voxel'
import { createStudGeometry } from '@/lib/studGeometry'
import { AxesGizmo } from '@/lib/AxesGizmo'
import { paletteIndexToThreeColor } from '@/lib/legoPalette'

const props = defineProps<{ vox: { w:number; h:number; depth:number; colors: Uint8Array }, mode?: BuildMode, exposure?: number, debug?: { useBasicMaterial?: boolean; paintRainbow12?: boolean; wireframe?: boolean; hideMesh?: boolean; showBounds?: boolean } }>()
const emit = defineEmits<{ (e:'layer-change', k:number): void; (e:'unique-colors', n:number): void }>()

const host = ref<HTMLDivElement|null>(null)

let renderer: any | null = null
let scene: any | null = null
let camera: any | null = null
let controls: any | null = null
let inst: any | null = null
let currentMesh: any | null = null
let animId = 0
let glCanvas: HTMLCanvasElement | null = null
let slicePlane: any | null = null
let appearStart = 0
let gizmo: AxesGizmo | null = null
let baseRGB: Float32Array | null = null
let boundsHelper: any | null = null

// Layer clipping
const layer = ref(0) // 0..(depth-1); will be set to depth-1 after build
let plane: any | null = null

// Per-layer color legend data (reactive)
const colorByLayer = shallowRef<Array<Record<string, number>>>([])
const showLayerSlider = computed(() => props.mode !== 'relief')
const instanceTotal = ref(0)
const showHints = ref(true)
// Visible bricks and colors reflect what is actually shown (0..layer)
const bricksVisible = computed(() => {
  if (!showLayerSlider.value) return instanceTotal.value
  const layers = colorByLayer.value
  const max = Math.min(layer.value, layers.length - 1)
  let sum = 0
  for (let i = 0; i <= max; i++) {
    const rec = layers[i]
    for (const k in rec) sum += rec[k]
  }
  return sum
})
const colorsVisible = computed(() => {
  const layers = colorByLayer.value
  const set = new Set<string>()
  if (!layers.length) return 0
  if (!showLayerSlider.value) {
    for (const rec of layers) for (const k in rec) set.add(k)
    return set.size
  }
  const max = Math.min(layer.value, layers.length - 1)
  for (let i = 0; i <= max; i++) {
    const rec = layers[i]
    for (const k in rec) set.add(k)
  }
  return set.size
})

const thumb = ref<HTMLCanvasElement | null>(null)
function drawMosaicThumbnail() {
  if (!thumb.value || !props.vox) return
  const { w, h, depth, colors } = props.vox
  const cvs = thumb.value
  cvs.width = w; cvs.height = h
  const ctx = cvs.getContext('2d')!
  const img = ctx.createImageData(w, h)
  // Build 2D indices for this layer (or top for relief)
  const zSel = Math.max(0, Math.min(layer.value, depth - 1))
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let pi = 0
      if (props.mode === 'relief') {
        // pick the topmost non-empty color for this (x,y)
        let found = 255
        for (let z = depth - 1; z >= 0; z--) {
          const idx = colors[(z * w * h) + (y * w + x)]
          if (idx !== 255) { found = idx; break }
        }
        pi = found === 255 ? 0 : found
      } else {
        const idx = colors[(zSel * w * h) + (y * w + x)]
        pi = idx === 255 ? 0 : idx
      }
      const { r, g, b } = paletteIndexToThreeColor(pi)
      const off = (y * w + x) * 4
      img.data[off + 0] = Math.round(r * 255)
      img.data[off + 1] = Math.round(g * 255)
      img.data[off + 2] = Math.round(b * 255)
      img.data[off + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  cvs.style.imageRendering = 'pixelated'
}

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
    // Always clear any global canvas handle to avoid persistence across navigations
    ;(window as any).__brikoCanvas = undefined
    renderer.dispose()
    renderer = null
    glCanvas = null
  }
  if (scene && boundsHelper) { scene.remove(boundsHelper); boundsHelper = null }
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

  // Z-up scheme: mosaic face is XY plane; front looks along +Z, top looks along +Y
  let dir = new THREE.Vector3(0, 0, 1).normalize() // front
  if (view === 'iso') dir = new THREE.Vector3(1, 1, 1).normalize()
  if (view === 'top') dir = new THREE.Vector3(0, 1, 0.001).normalize()

  camera.position.copy(center).add(dir.multiplyScalar(dist))
  camera.near = Math.max(0.1, dist / 100)
  camera.far  = dist * 100
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  ;(controls as any).minDistance = Math.max(0.1, maxSize * 0.5)
  ;(controls as any).maxDistance = Math.max(1.0, maxSize * 6)
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
  ;(controls as any).minDistance = Math.max(0.1, maxSize * 0.5)
  ;(controls as any).maxDistance = Math.max(1.0, maxSize * 6)
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
  renderer.toneMapping = (props.debug?.useBasicMaterial ? (THREE as any).NoToneMapping : (THREE as any).ACESFilmicToneMapping)
  // Keep exposure neutral; brightness is applied per-instance color
  renderer.toneMappingExposure = 1.0
  renderer.localClippingEnabled = true
  renderer.clippingPlanes = [] // start with no clipping to avoid accidental full-clip
  host.value.appendChild(renderer.domElement)
  glCanvas = renderer.domElement
  ;(window as any).__brikoCanvas = glCanvas

  // Scene + Camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1220)
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = true
  controls.enableZoom = true
  controls.autoRotate = true
  ;(controls as any).autoRotateSpeed = 0.4
  const stopAuto = () => { if (controls && (controls as any).autoRotate) (controls as any).autoRotate = false }
  controls.addEventListener('start', stopAuto)
  controls.addEventListener('change', stopAuto)

  // Lights: Ambient + key directional (optionally rim)
  const amb = new THREE.AmbientLight(0xffffff, 0.4)
  const key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(50, 100, 50)
  const rim = new THREE.DirectionalLight(0xffffff, 0.35); rim.position.set(-30, 20, -20)
  key.castShadow = false; rim.castShadow = false
  scene.add(amb, key, rim)

  // Instanced mesh geometry: LEGO-like stud/brick, Z-up
  const geo = createStudGeometry({
    kind: (props.mode === 'relief') ? 'brick' : 'plate',
    stud: true,
    pitch: 1.0,
    radialSegments: 16,
  })
  function makeMaterial(){
    const common:any = { vertexColors: true, flatShading: true, color: 0xffffff, wireframe: !!props.debug?.wireframe, side: (THREE as any).FrontSide, toneMapped: false }
    return props.debug?.useBasicMaterial
      ? new THREE.MeshBasicMaterial(common)
      : new THREE.MeshStandardMaterial({ ...common, metalness: 0.0, roughness: 1.0 })
  }
  const mat = makeMaterial()
  inst = new (THREE as any).InstancedMesh(geo, mat, colors.length)
  // Ensure instanceColor buffer exists before setColorAt()
  ;(inst as any).instanceColor = new (THREE as any).InstancedBufferAttribute(new Float32Array(colors.length * 3), 3)

  let i = 0
  const m = new THREE.Matrix4()
  const c = new THREE.Color()
  const base: number[] = []
  // Reset color legends for this build (reactive)
  const layers: Array<Record<string, number>> = Array.from({ length: depth }, () => ({}))
  for (let z=0; z<depth; z++) {
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const ci = colors[(z*w*h) + (y*w + x)]
        if (ci === 255) continue // 255 sentinel = empty voxel
        const hex = legoPalette[ci]?.hex
        if (hex === undefined) continue
        // Place in XY with depth along Z (Z-up)
        m.makeTranslation(x - w/2, y - h/2, z)
        ;(inst as any).setMatrixAt(i, m)
        c.set(hex)
        // store base linear RGB
        base.push(c.r, c.g, c.b)
        // apply brightness per-instance (not via lights)
        const bf = Math.max(0, props.exposure ?? 1.0)
        const cr = Math.min(1, c.r * bf)
        const cg = Math.min(1, c.g * bf)
        const cb = Math.min(1, c.b * bf)
        ;(inst as any).setColorAt(i, new THREE.Color(cr, cg, cb))
        // Tally per-layer color counts (by hex)
        const rec = layers[z]
        rec[hex] = (rec[hex] ?? 0) + 1
        i++
      }
    }
  }
  ;(inst as any).count = i
  baseRGB = new Float32Array(base)
  // publish legend reactively and apply brightness once
  colorByLayer.value = layers
  reapplyBrightness()
  instanceTotal.value = i
  ;(inst as any).instanceMatrix.needsUpdate = true
  ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
  ;(inst as any).frustumCulled = false
  ;(inst as any).visible = !props.debug?.hideMesh
  // Debug: paint first 12 studs rainbow for color path verification
  if (props.debug?.paintRainbow12) {
    const TEST = [0xff0000,0x00ff00,0x0000ff,0xffff00,0xff00ff,0x00ffff,0xffffff,0x000000,0xff8024,0x923978,0x00a85a,0xf2cd37]
    for (let j=0;j<Math.min(12, (inst as any).count); j++) {
      ;(inst as any).setColorAt(j, new THREE.Color(TEST[j]))
    }
    ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
  }
  scene.add(inst)
  // Optional bounds helper for debugging
  if (props.debug?.showBounds) {
    const box = new (THREE as any).Box3().setFromObject(inst)
    boundsHelper = new (THREE as any).Box3Helper(box, 0x00e5a0)
    scene.add(boundsHelper)
  }
  currentMesh = inst
  appearStart = (performance as any).now?.() ?? Date.now()
  // Debug: log unique base colors in the instanced mesh
  try {
    const uniq = new Set<string>()
    for (let j=0; j<base.length; j+=3) {
      const key = `${Math.round(base[j]*255)},${Math.round(base[j+1]*255)},${Math.round(base[j+2]*255)}`
      uniq.add(key)
    }
    console.log('[VoxelPreview] Unique instance colors:', uniq.size)
    emit('unique-colors', uniq.size)
  } catch {}

  // Ground grid (faint)
  const gridSize = Math.max(size * 2, 200)
  const grid = new THREE.GridHelper(gridSize, gridSize, 0x2f3545, 0x1a1f2a)
  ;(grid as any).rotation.x = Math.PI / 2 // lie on XY
  // fade grid
  const gm = (grid as any).material
  if (Array.isArray(gm)) { gm.forEach((m:any) => { m.transparent = true; m.opacity = 0.25 }) }
  else { gm.transparent = true; gm.opacity = 0.25 }
  scene.add(grid)

  // Clipping plane to reveal layers [0..k] — arm after first successful render
  plane = null

  // Slice plane visual indicator (mint, semi-transparent)
  const pgeom = new (THREE as any).PlaneGeometry(Math.max(w, h), Math.max(w, h)) // XY plane by default
  const pmat = new (THREE as any).MeshBasicMaterial({ color: 0x00e5a0, transparent: true, opacity: 0.12, depthWrite: false })
  slicePlane = new (THREE as any).Mesh(pgeom, pmat)
  ;(slicePlane as any).position.z = layer.value
  ;(slicePlane as any).renderOrder = 999
  if (showLayerSlider.value) scene.add(slicePlane)

  // Axes Gizmo
  gizmo = new AxesGizmo()

  // Fit and size
  resize()
  fitCameraToObject(inst, 1.35)
  // Default to an isometric view for depth; auto-rotate until interaction
  setView('iso')
  // Initialize slider to show all layers by default
  layer.value = Math.max(0, depth - 1)
  if (plane) plane.constant = -layer.value
  emit('layer-change', layer.value)
  window.addEventListener('resize', resize, { passive: true })

  // Render loop
  const tick = () => {
    // Appear animation on new mesh
    if (currentMesh && appearStart) {
      const t = Math.min(1, (( (performance as any).now?.() ?? Date.now()) - appearStart) / 500)
      const ease = 1 - Math.pow(1 - t, 3)
      const s = 0.85 + 0.15 * ease
      currentMesh.scale.set(s, s, s)
      if (t >= 1) appearStart = 0
    }
    controls && controls.update()
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
      // Arm clipping after first successful render to avoid accidental full-clip
      if (!plane && showLayerSlider.value) {
        plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -layer.value)
        renderer.clippingPlanes = [plane]
      }
      if (gizmo) {
        gizmo.syncFrom(camera)
        gizmo.render(renderer)
      }
    }
    animId = requestAnimationFrame(tick)
  }
  tick()
  // Draw 2D mosaic thumbnail once built
  drawMosaicThumbnail()
}

onMounted(async () => { await nextTick(); resize(); })
onMounted(build)
onMounted(() => {
  // First-time hints auto-hide after 5s or on interaction
  const hide = () => { showHints.value = false }
  const t = setTimeout(hide, 5000)
  const el = host.value
  const off = () => {
    clearTimeout(t)
    hide()
    el && (el.removeEventListener('pointerdown', off), el.removeEventListener('wheel', off), el.removeEventListener('touchstart', off))
  }
  el?.addEventListener('pointerdown', off, { passive: true })
  el?.addEventListener('wheel', off, { passive: true })
  el?.addEventListener('touchstart', off, { passive: true })
})
watch(() => props.vox, async () => { await nextTick(); build() })
watch(() => props.mode, async () => { await nextTick(); build() })
watch(() => props.debug, async () => { await nextTick(); build() }, { deep: true })
function reapplyBrightness() {
  if (!inst || !baseRGB) return
  const count = (inst as any).count || 0
  const bf = Math.max(0, (typeof props.exposure === 'number' ? props.exposure : 1.0))
  const c = new THREE.Color()
  for (let j=0; j<count; j++) {
    const r0 = baseRGB[j*3 + 0]
    const g0 = baseRGB[j*3 + 1]
    const b0 = baseRGB[j*3 + 2]
    c.setRGB(Math.min(1, r0 * bf), Math.min(1, g0 * bf), Math.min(1, b0 * bf))
    ;(inst as any).setColorAt(j, c)
  }
  ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
}
watch(() => props.exposure, () => { reapplyBrightness() })
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  disposeScene()
})

// Layer control bindings
watch(layer, (k) => {
  if (!renderer || !plane) return
  plane.constant = -k
  // keep controls target at content center to prevent drift
  if (currentMesh && controls) {
    const box = new THREE.Box3().setFromObject(currentMesh)
    const center = new THREE.Vector3(); box.getCenter(center)
    controls.target.copy(center)
    controls.update()
  }
  if (slicePlane) (slicePlane as any).position.z = k
  // update thumbnail
  drawMosaicThumbnail()
  emit('layer-change', k)
})

// Expose quick view methods to parent + internals for PDF export
function toFront(){ setView('front') }
function toIso(){ setView('iso') }
function toTop(){ setView('top') }
function getCountsForLayer(k:number){
  const acc: Record<string, number> = {}
  const max = Math.min(k, colorByLayer.value.length - 1)
  for (let i = 0; i <= max; i++) {
    const rec = colorByLayer.value[i]
    for (const hex in rec) acc[hex] = (acc[hex] ?? 0) + rec[hex]
  }
  return acc
}
// Debug helper: paint N test studs with a hue ramp
function testPaintStuds(n:number = 100){
  if (!inst) return
  const total = Math.min(n, (inst as any).count || 0)
  const c = new THREE.Color()
  for (let j=0; j<total; j++) {
    c.setHSL((j/total), 0.8, 0.5)
    ;(inst as any).setColorAt(j, c)
  }
  ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
}
defineExpose({ setView, toFront, toIso, toTop, renderer, scene, camera, depth: () => props.vox.depth, setLayer: (k:number) => { layer.value = k }, getCountsForLayer, testPaintStuds })
</script>

<template>
  <div>
    <div class="relative">
      <div ref="host" class="w-full h-[480px] rounded-xl bg-black/20"></div>
      <!-- Debug overlay -->
      <div class="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-black/55 text-white/95 ring-1 ring-white/10">
        <div><span class="opacity-70">Mode:</span>
          <span>
            {{ (props.mode === 'relief') ? 'Relief (height-map)' : (props.mode === 'hollow') ? 'Layered Mosaic (hollow)' : 'Layered Mosaic' }}
          </span>
        </div>
        <div><span class="opacity-70">Bricks visible:</span> {{ bricksVisible.toLocaleString() }}</div>
        <div v-if="vox && showLayerSlider"><span class="opacity-70">Layers:</span> 0–{{ layer }} of {{ vox.depth }}</div>
        <div v-else><span class="opacity-70">Layers:</span> {{ vox?.depth }}</div>
        <div><span class="opacity-70">Colors:</span> {{ colorsVisible }}</div>
      </div>
      <!-- First-time hints -->
      <div v-if="showHints" class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded bg-black/40 text-white/80 ring-1 ring-white/10">
        ↻ Drag to rotate &nbsp;&nbsp; ⬍ Scroll to zoom &nbsp;&nbsp; ⇅ Use slider to step layers
      </div>
    </div>
    <!-- 2D mosaic thumbnail (crisp) -->
    <div v-if="vox" class="mt-2">
      <canvas ref="thumb" class="w-32 h-32 rounded-md ring-1 ring-white/10"></canvas>
    </div>
    <div v-if="vox && showLayerSlider" class="mt-2">
      <label class="block text-sm mb-1">Step through layers</label>
      <input type="range" min="0" :max="vox.depth - 1" v-model.number="layer" class="w-full range-mint" />
      <div class="text-xs text-white/60">Showing layers 0–{{ layer }} of {{ vox.depth }}</div>
    </div>
  </div>
  </template>
