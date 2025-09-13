<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { LEGO_PALETTE } from '@/lib/legoPalette'
import type { BuildMode } from '@/types/voxel'
import { createStudGeometry } from '@/lib/studGeometry'
import { AxesGizmo } from '@/lib/AxesGizmo'
import { paletteIndexToThreeColor } from '@/lib/legoPalette'
import { VoxelViewer } from '@/components/three/VoxelViewer'

const props = defineProps<{ vox: { w:number; h:number; depth:number; colors: Uint8Array }, mode?: BuildMode, exposure?: number, debug?: { useBasicMaterial?: boolean; paintRainbow12?: boolean; wireframe?: boolean; hideMesh?: boolean; showBounds?: boolean }, debug3d?: boolean }>()
const emit = defineEmits<{ (e:'layer-change', k:number): void; (e:'unique-colors', n:number): void }>()

const host = ref<HTMLDivElement|null>(null)

// Debug flag via URL: ?debug3d
const DEBUG = new URLSearchParams(location.search).has('debug3d')

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
let smokeMesh: any | null = null
let viewer: VoxelViewer | null = null

// Persistent debug option: force a constant white material (ignores instance colors)
const FLAT_WHITE_KEY = 'briko_flat_white'
let forceFlatWhite = false
try { forceFlatWhite = (localStorage.getItem(FLAT_WHITE_KEY) === '1') } catch {}

// Layer clipping
const layer = ref(0) // 0..(depth-1); will be set to depth-1 after build
let plane: any | null = null
let gridW = 0, gridH = 0, gridD = 0

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
  if (scene && smokeMesh) { scene.remove(smokeMesh); try { smokeMesh.dispose?.() } catch {} smokeMesh = null }
  scene = null; camera = null
}

// View helpers
type ViewName = 'front' | 'iso' | 'top'
function setView(view: ViewName) {
  if (!camera || !controls) return
  // Use grid dimensions for reliable framing (InstancedMesh bbox ignores instances)
  const size = new THREE.Vector3(gridW || 1, gridH || 1, gridD || 1)
  const center = new THREE.Vector3(0, 0, Math.max(0.5, (gridD || 1) / 2))

  // Fit size depends on view: Front fits XY, Top fits XZ, Iso fits all
  let fitSize = Math.max(size.x, size.y, size.z)
  if (view === 'front') fitSize = Math.max(size.x, size.y)
  if (view === 'top')   fitSize = Math.max(size.x, size.z)
  const fov = THREE.MathUtils.degToRad((camera as any).fov)
  const dist = ((fitSize / 2) / Math.tan(fov / 2)) * 1.2

  // Z-up scheme: mosaic face is XY plane; front looks along +Z, top looks along +Y
  let dir = new THREE.Vector3(0, 0, 1).normalize() // front
  if (view === 'iso') dir = new THREE.Vector3(1, 1, 1).normalize()
  if (view === 'top') dir = new THREE.Vector3(0, 1, 0.001).normalize()

  camera.position.copy(center).add(dir.multiplyScalar(dist))
  camera.near = Math.max(0.1, dist / 100)
  camera.far  = dist * 100
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  ;(controls as any).minDistance = Math.max(0.1, fitSize * 0.5)
  ;(controls as any).maxDistance = Math.max(1.0, fitSize * 6)
  controls.update()
}

// Auto-frame camera to an axis-aligned build volume (debug helper)
function frameToGrid(w: number, h: number, d: number) {
  if (!camera || !controls) return
  const radius = Math.max(w, h, d)
  const center = new THREE.Vector3(0, 0, Math.max(0.5, d * 0.5))
  controls.target.copy(center)
  ;(controls as any).minDistance = Math.max(0.1, radius * 0.5)
  ;(controls as any).maxDistance = Math.max(1, radius * 6)
  camera.near = Math.max(0.1, radius * 0.001)
  camera.far  = Math.max(10, radius * 20)
  camera.position.set(center.x + radius * 1.2, center.y + radius * 1.2, center.z + radius * 2.2)
  camera.updateProjectionMatrix()
  controls.update()
}

function fitCameraToObject (obj: any, padding = 1.25) {
  if (!camera || !controls) return
  const size = new THREE.Vector3(gridW || 1, gridH || 1, gridD || 1)
  const center = new THREE.Vector3((gridW || 1) / 2, (gridH || 1) / 2, (gridD || 1) / 2)

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
  // If in debug3d mode, we rely on the lightweight VoxelViewer and skip internal build
  if (props.debug3d) {
    return
  }
  disposeScene()

  const { w, h, depth, colors } = props.vox
  const size = Math.max(w, h, depth)
  const DBG = !!props.debug3d || DEBUG

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = (THREE as any).SRGBColorSpace
  // Force a known-good render path: Basic + NoToneMapping
  renderer.toneMapping = (THREE as any).NoToneMapping
  renderer.toneMappingExposure = 1.0
  // Keep clipping OFF initially; arm later when stable
  renderer.localClippingEnabled = false
  renderer.clippingPlanes = []
  host.value.appendChild(renderer.domElement)
  glCanvas = renderer.domElement
  ;(window as any).__brikoCanvas = glCanvas

  // Scene + Camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1220)
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
  // Z-up world: ensure camera up vector matches to avoid odd rotations
  ;(camera as any).up.set(0, 0, 1)

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
  function makeMaterial () {
    // Force MeshBasic for visibility (ignore lighting while debugging)
    if (forceFlatWhite) {
      return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: (THREE as any).DoubleSide,
        toneMapped: false,
      })
    }
    return new THREE.MeshBasicMaterial({
      vertexColors: true,
      flatShading: true,
      side: (THREE as any).DoubleSide,
      toneMapped: false,
      wireframe: !!props.debug?.wireframe,
    })
  }
  let material: any = makeMaterial()
  function applyMaterial(newMat?: any) {
    if (!inst) return
    try { material?.dispose?.() } catch {}
    material = newMat || makeMaterial()
    ;(inst as any).material = material
    ;(inst as any).material.needsUpdate = true
  }

  // Debug smoke test grid to validate renderer/material/camera path
  function makeSmokeTest(): any {
    const gw = 16, gh = 16, gd = 1, size1 = 1
    const g = new (THREE as any).BoxGeometry(size1, size1, size1)
    const test = new (THREE as any).InstancedMesh(g, material, gw * gh * gd)
    const m = new THREE.Matrix4()
    let t = 0
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        m.makeTranslation(x + 0.5, y + 0.5, 0.5)
        ;(test as any).setMatrixAt(t, m)
        const c = new THREE.Color((x % 3 === 0) ? 0xff3366 : (x % 3 === 1) ? 0x33ff66 : 0x3366ff).convertSRGBToLinear()
        ;(test as any).setColorAt(t, c)
        t++
      }
    }
    ;(test as any).instanceColor = new (THREE as any).InstancedBufferAttribute(new Float32Array(t * 3), 3)
    ;(test as any).frustumCulled = false
    return test
  }
  if (DBG) {
    smokeMesh = makeSmokeTest()
    scene.add(smokeMesh)
    frameToGrid(16, 16, 1)
    console.log('[SMOKE] scene ok; instanceCount', (smokeMesh as any).count)
  }
  const capacity = colors.length // upper bound W*H*depth
  inst = new (THREE as any).InstancedMesh(geo, material, capacity)
  // Ensure instanceColor buffer exists before setColorAt() across all builds
  ;(inst as any).instanceColor = new (THREE as any).InstancedBufferAttribute(new Float32Array(capacity * 3), 3)
  // Ensure no inherited scaling surprises
  ;(inst as any).scale.set(1, 1, 1)

  let j = 0 // contiguous write index for non-empty voxels
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3(1, 1, 1)
  const c = new THREE.Color()
  const base: number[] = []
  // Grid dims for debug helpers
  gridW = w; gridH = h; gridD = depth
  // Reset color legends for this build (reactive)
  const layers: Array<Record<string, number>> = Array.from({ length: depth }, () => ({}))
  for (let z=0; z<depth; z++) {
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const ci = colors[(z*w*h) + (y*w + x)]
        if (ci === 255) continue // 255 sentinel = empty voxel
        const hex = LEGO_PALETTE[ci]?.hex
        if (hex === undefined) continue
        // Place 1 unit per stud, centered in each cell + center whole grid around origin
        // x∈[0.5-w/2..W-0.5-w/2], y∈[0.5-h/2..H-0.5-h/2], z∈[0.5..depth-0.5]
        m.compose(new THREE.Vector3(x + 0.5 - w/2, y + 0.5 - h/2, z + 0.5), q, s)
        ;(inst as any).setMatrixAt(j, m)
        c.setHex(hex).convertSRGBToLinear()
        // store base linear RGB
        base.push(c.r, c.g, c.b)
        // apply brightness per-instance (not via lights)
        const bf = Math.max(0, props.exposure ?? 1.0)
        const cr = Math.min(1, c.r * bf)
        const cg = Math.min(1, c.g * bf)
        const cb = Math.min(1, c.b * bf)
        ;(inst as any).setColorAt(j, new THREE.Color(cr, cg, cb))
        // Tally per-layer color counts (by hex)
        const rec = layers[z]
        rec[hex] = (rec[hex] ?? 0) + 1
        j++
      }
    }
  }
  ;(inst as any).count = j
  baseRGB = new Float32Array(base)
  // publish legend reactively and apply brightness once
  colorByLayer.value = layers
  reapplyBrightness()
  instanceTotal.value = j
  ;(inst as any).instanceMatrix.needsUpdate = true
  ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
  ;(inst as any).frustumCulled = false
  ;(inst as any).visible = !props.debug?.hideMesh
  // Sanity log: capacity vs written instances
  try {
    const ic: any = (inst as any).instanceColor
    const icCount = (ic && typeof ic.count === 'number') ? ic.count : capacity
    console.log('[VoxelPreview] build stats', { capacity: icCount, written: (inst as any).count, W: w, H: h, depth })
  } catch {}
  // Debug: paint first 12 studs rainbow for color path verification
  if (props.debug?.paintRainbow12) {
    const TEST = [0xff0000,0x00ff00,0x0000ff,0xffff00,0xff00ff,0x00ffff,0xffffff,0x000000,0xff8024,0x923978,0x00a85a,0xf2cd37]
    for (let j=0;j<Math.min(12, (inst as any).count); j++) {
      ;(inst as any).setColorAt(j, new THREE.Color(TEST[j]))
    }
    ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
  }
  scene.add(inst)
  // Expose robust diagnostics to DevTools for normal path
  try {
    const wany = window as any
    wany.__briko = {
      scene,
      renderer,
      inst,
      THREE,
      // Material overrides
      flatWhite(on?: boolean) {
        try {
          if (typeof on === 'boolean') forceFlatWhite = on
          else forceFlatWhite = !forceFlatWhite
          try { localStorage.setItem(FLAT_WHITE_KEY, forceFlatWhite ? '1' : '0') } catch {}
          applyMaterial()
          return forceFlatWhite
        } catch (e) { console.warn(e) }
      },
      flatWhiteOn()  { try { return (this as any).flatWhite(true) } catch {} },
      flatWhiteOff() { try { return (this as any).flatWhite(false) } catch {} },
      flatWhiteToggle() { try { return (this as any).flatWhite() } catch {} },
      info() {
        try {
          const box = new THREE.Box3().setFromObject(inst)
          const size = new THREE.Vector3(); box.getSize(size)
          const center = new THREE.Vector3(); box.getCenter(center)
          const out = { inst_count: (inst as any).count, color_attr: !!(inst as any).instanceColor, bbox_size: size, bbox_center: center }
          console.log(out)
          return out
        } catch (e) { console.warn(e) }
      },
      peek() {
        try {
          const M = new THREE.Matrix4()
          ;(inst as any).getMatrixAt(0, M)
          const arr = Array.from(((inst as any).instanceColor?.array ?? new Float32Array()).slice(0, 9))
          const out = { M0: M.toArray(), C0_2: arr }
          console.log(out)
          return out
        } catch (e) { console.warn(e) }
      },
      // View helpers
      front() { try { setView('front') } catch {} },
      iso()   { try { setView('iso') } catch {} },
      top()   { try { setView('top') } catch {} },
      smoke() {
        // draw a 16x16 flat grid to prove camera/material path
        const gw = 16, gh = 16
        const box = new (THREE as any).BoxGeometry(1, 1, 1)
        const smMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
        const sm = new (THREE as any).InstancedMesh(box, smMat, gw * gh)
        ;(sm as any).instanceColor = new (THREE as any).InstancedBufferAttribute(new Float32Array(gw * gh * 3), 3)
        const m = new THREE.Matrix4(), c = new THREE.Color()
        let t = 0
        for (let y = 0; y < gh; y++) {
          for (let x = 0; x < gw; x++) {
            m.makeTranslation(x - gw/2 + 0.5, y - gh/2 + 0.5, 0)
            ;(sm as any).setMatrixAt(t, m)
            c.set((x % 3 === 0) ? 0xff3366 : (x % 3 === 1) ? 0x33ff66 : 0x3366ff).convertSRGBToLinear()
            ;(sm as any).setColorAt(t, c)
            t++
          }
        }
        ;(sm as any).count = t
        ;(sm as any).frustumCulled = false
        scene.add(sm)
        wany.__briko.smokeMesh = sm
        // Frame to smoke grid for visibility
        try { (camera && controls) && frameToGrid(gw, gh, 1) } catch {}
        return sm
      },
      paint(n = 100) {
        try {
          const cnt = Math.min(n, (inst as any).count || 0)
          const col = new THREE.Color(0xffffff)
          for (let i = 0; i < cnt; i++) (inst as any).setColorAt(i, col)
          ;(inst as any).instanceColor && (((inst as any).instanceColor.needsUpdate = true))
          return cnt
        } catch (e) { console.warn(e) }
      },
      armClip() {
        try {
          plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(depth - 1))
          renderer.localClippingEnabled = true
          renderer.clippingPlanes = [plane]
        } catch (e) { console.warn(e) }
      },
      unclip() {
        try { renderer.clippingPlanes = []; renderer.localClippingEnabled = false } catch (e) { console.warn(e) }
      },
      reframe() { try { frameToGrid(gridW, gridH, gridD) } catch (e) { console.warn(e) } },
      debugInfo() { try { return debugInfo() } catch {} }
    }
    console.log('[DEBUG] __briko ready')
  } catch {}
  // Debug toggles on window
  if (DBG) {
    const wany = window as any
    wany.briko = wany.briko || {}
    Object.assign(wany.briko, {
      wire: () => { if (!inst) return; const mat:any = (inst as any).material; mat.wireframe = !mat.wireframe },
      basic: () => {
        if (!inst || !renderer) return
        material?.dispose?.()
        material = new THREE.MeshBasicMaterial({
          vertexColors: true, flatShading: true, wireframe: !!props.debug?.wireframe,
          side: (THREE as any).FrontSide, toneMapped: false,
        })
        ;(inst as any).material = material
        renderer.toneMapping = (THREE as any).NoToneMapping
      },
      std: () => {
        if (!inst || !renderer) return
        material?.dispose?.()
        material = new THREE.MeshStandardMaterial({
          vertexColors: true, flatShading: true, wireframe: !!props.debug?.wireframe,
          side: (THREE as any).FrontSide, toneMapped: false, metalness: 0.0, roughness: 1.0,
        })
        ;(inst as any).material = material
        renderer.toneMapping = (THREE as any).ACESFilmicToneMapping
      },
      clipOff: () => { if (!renderer) return; renderer.clippingPlanes = []; renderer.localClippingEnabled = false },
      resetCam: () => frameToGrid(gridW, gridH, gridD),
      smokeOn: () => { if (!scene) return; if (!smokeMesh) { smokeMesh = makeSmokeTest(); scene.add(smokeMesh); frameToGrid(16,16,1) } },
      smokeOff: () => { if (scene && smokeMesh) { scene.remove(smokeMesh); try { smokeMesh.dispose?.() } catch {}; smokeMesh = null } }
    })
    console.log('[DEBUG] briko hooks ready')
  }
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

  // Ground grid (faint) — centered at origin under the mesh
  const gridSize = Math.max(Math.max(w, h) * 2, 128)
  const grid = new THREE.GridHelper(gridSize, gridSize, 0x2f3545, 0x1a1f2a)
  ;(grid as any).rotation.x = Math.PI / 2 // lie on XY
  ;(grid as any).position.set(0, 0, 0)
  // fade grid (draw behind and let studs occlude it)
  const gm = (grid as any).material
  if (Array.isArray(gm)) { gm.forEach((m:any) => { m.transparent = true; m.opacity = 0.25; m.depthWrite = false; m.depthTest = true }) }
  else { gm.transparent = true; gm.opacity = 0.25; (gm as any).depthWrite = false; (gm as any).depthTest = true }
  ;(grid as any).renderOrder = -1
  scene.add(grid)

  // Clipping plane to reveal layers [0..k] — arm after first successful render
  plane = null

  // Slice plane visual indicator (mint, semi-transparent)
  const pgeom = new (THREE as any).PlaneGeometry(Math.max(w, h), Math.max(w, h)) // XY plane by default
  const pmat = new (THREE as any).MeshBasicMaterial({ color: 0x00e5a0, transparent: true, opacity: 0.12, depthWrite: false, depthTest: false })
  slicePlane = new (THREE as any).Mesh(pgeom, pmat)
  ;(slicePlane as any).position.set(0, 0, layer.value)
  ;(slicePlane as any).renderOrder = 999
  if (showLayerSlider.value) { scene.add(slicePlane); (slicePlane as any).visible = false }

  // Axes Gizmo
  gizmo = new AxesGizmo()

  // Fit and size
  resize()
  // Frame camera using origin-centered grid dims and default to FRONT view for layered mosaics
  frameToGrid(gridW, gridH, gridD)
  setView('front')
  // Initialize slider to show all layers by default
  layer.value = Math.max(0, depth - 1)
  if (plane) plane.constant = -layer.value
  emit('layer-change', layer.value)
  window.addEventListener('resize', resize, { passive: true })

  // Render loop
  const tick = () => {
    controls && controls.update()
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
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
onMounted(() => {
  if (!host.value) return
  if (props.debug3d) {
    // Initialize lightweight viewer and bind hooks
    viewer = new VoxelViewer(host.value)
    const wany = window as any
    wany.briko = {
      smokeOn: () => viewer?.smokeOn(),
      wire:    () => viewer?.wire(),
      basic:   () => viewer?.basic(),
      std:     () => viewer?.pbr(),
      clipOff: () => viewer?.clipOff(),
      resetCam:() => viewer?.resetCam(),
      info:    () => viewer?.info(),
    }
    console.log('[DEBUG] briko hooks ready')
  } else {
    build()
  }
})
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
watch(() => props.vox, async () => { await nextTick(); if (!props.debug3d) build() })
watch(() => props.mode, async () => { await nextTick(); if (!props.debug3d) build() })
watch(() => props.debug, async () => { await nextTick(); if (!props.debug3d) build() }, { deep: true })
watch(() => props.debug3d, async () => {
  await nextTick()
  // Toggle between debug viewer and full internal build
  if (props.debug3d) {
    disposeScene()
    if (host.value) {
      viewer?.destroy(); viewer = null
      viewer = new VoxelViewer(host.value)
      const wany = window as any
      wany.briko = {
        smokeOn: () => viewer?.smokeOn(),
        wire:    () => viewer?.wire(),
        basic:   () => viewer?.basic(),
        std:     () => viewer?.pbr(),
        clipOff: () => viewer?.clipOff(),
        resetCam:() => viewer?.resetCam(),
        info:    () => viewer?.info(),
      }
      console.log('[DEBUG] briko hooks ready')
    }
  } else {
    // Clear hooks and build full path
    const wany = window as any
    if (wany.briko) wany.briko = undefined
    viewer?.destroy(); viewer = null
    build()
  }
})
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
  // clear debug hooks
  const wany = window as any
  if (wany.briko) wany.briko = undefined
  // destroy debug viewer if active
  viewer?.destroy(); viewer = null
  disposeScene()
})

// Layer control bindings
watch(layer, (k) => {
  if (!renderer || !plane) return
  plane.constant = -k
  // keep controls target at content center to prevent drift
  if (currentMesh && controls) {
    const center = new THREE.Vector3((gridW || 1) / 2, (gridH || 1) / 2, Math.max(0.5, (gridD || 1) * 0.5))
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
// Local debug button handlers (call window.briko hooks if present)
const dbgSmokeOn = () => { (window as any).briko?.smokeOn?.() }
const dbgWire    = () => { (window as any).briko?.wire?.() }
const dbgBasic   = () => { (window as any).briko?.basic?.() }
const dbgStd     = () => { (window as any).briko?.std?.() }
const dbgClipOff = () => { (window as any).briko?.clipOff?.() }
const dbgResetCam= () => { (window as any).briko?.resetCam?.() }
// Debug helper: log first instance transform
function debugInfo(){
  if (!inst) { console.log('No instanced mesh yet'); return }
  const m = new THREE.Matrix4(); const v = new THREE.Vector3(); const q = new THREE.Quaternion(); const s = new THREE.Vector3()
  try { (inst as any).getMatrixAt(0, m); m.decompose(v, q, s) } catch {}
  console.log('[VoxelPreview.debugInfo]', { count: (inst as any).count, firstPos: { x: v.x, y: v.y, z: v.z }, scale: { x: s.x, y: s.y, z: s.z } })
}
defineExpose({ setView, toFront, toIso, toTop, renderer, scene, camera, depth: () => props.vox.depth, setLayer: (k:number) => { layer.value = k }, getCountsForLayer, testPaintStuds, debugInfo })
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
  <!-- On-screen debug bar (debug3d only) -->
  <div v-if="debug3d" class="fixed bottom-4 right-4 z-50 flex gap-2 rounded-xl bg-black/50 px-3 py-2 text-xs">
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgSmokeOn">Smoke</button>
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgWire">Wire</button>
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgBasic">Basic</button>
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgStd">PBR</button>
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgClipOff">Clip Off</button>
    <button class="btn-soft h-7 px-2 rounded-md" @click="dbgResetCam">Reset Cam</button>
  </div>
  </template>
