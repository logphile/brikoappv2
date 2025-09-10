<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps<{ vox: { w:number; h:number; depth:number; colors: Uint8Array } }>()
const host = ref<HTMLDivElement|null>(null)

let renderer: any | null = null
let scene: any | null = null
let camera: any | null = null
let controls: any | null = null
let inst: any | null = null
let animId = 0
let glCanvas: HTMLCanvasElement | null = null

// TODO: replace with real LEGO palette mapping later
const PALETTE = ['#1B1B1B','#6D6E6E','#A3A3A3','#F4F4F4','#C91A09','#F2CD37','#FE8A18','#2DD4BF']

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

  // Instanced mesh
  const geo = new THREE.BoxGeometry(1,1,1)
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, roughness: 0.95 })
  inst = new (THREE as any).InstancedMesh(geo, mat, colors.length)

  let i = 0
  const m = new THREE.Matrix4()
  const c = new THREE.Color()
  for (let z=0; z<depth; z++) {
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const ci = colors[(z*w*h) + (y*w + x)]
        if (!ci) continue
        m.makeTranslation(x - w/2, z, y - h/2)
        ;(inst as any).setMatrixAt(i, m)
        c.set(PALETTE[ci])
        ;(inst as any).setColorAt(i, c)
        i++
      }
    }
  }
  ;(inst as any).count = i
  ;(inst as any).instanceMatrix.needsUpdate = true
  ;(inst as any).instanceColor && ((inst as any).instanceColor.needsUpdate = true)
  ;(inst as any).frustumCulled = false
  scene.add(inst)

  // Ground/grid (optional)
  const grid = new THREE.GridHelper(size, size, 0x444444, 0x222222)
  ;(grid as any).rotation.x = Math.PI / 2
  scene.add(grid)

  // Fit and size
  resize()
  fitCameraToObject(inst, 1.35)
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
</script>

<template><div ref="host" class="w-full h-[480px] rounded-xl bg-black/20"></div></template>
