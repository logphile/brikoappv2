<template>
  <div ref="host" class="w-full h-[480px] rounded-2xl bg-black/30 ring-1 ring-white/10 overflow-hidden"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { legoPalette } from '@/lib/palette/lego'
import type { TiledBrick } from '@/types/mosaic'

const props = defineProps<{
  bricks: TiledBrick[]
  studSize?: number
  visibleLayers: number
}>()

const host = ref<HTMLDivElement | null>(null)
let renderer: any = null
let scene: any = null
let camera: any = null
let controls: any = null
let group: any = null
let raf = 0

const hexToColor = (hex: string) => new (THREE as any).Color(hex)

function buildGroup() {
  if (!scene) return
  if (group) {
    scene.remove(group)
    group.traverse((o: any) => {
      if ((o as any).dispose) (o as any).dispose()
    })
  }
  group = new (THREE as any).Group()
  const s = props.studSize ?? 1

  // batch by key: colorId|w|h
  const byKey = new Map<string, { w: number; h: number; colorId: number; items: { x: number; y: number }[] }>()
  for (const b of props.bricks) {
    if (b.y >= props.visibleLayers) continue
    const key = `${b.colorId}|${b.w}|${b.h}`
    let rec = byKey.get(key)
    if (!rec) {
      rec = { w: b.w, h: b.h, colorId: b.colorId, items: [] }
      byKey.set(key, rec)
    }
    rec.items.push({ x: b.x, y: b.y })
  }

  for (const rec of byKey.values()) {
    const palette = legoPalette
    const color = palette[rec.colorId]?.hex || '#cccccc'
    const mat = new (THREE as any).MeshLambertMaterial({ color: hexToColor(color) })
    const geom = new (THREE as any).BoxGeometry(rec.w * s, rec.h * s, 1 * s)
    const mesh = new (THREE as any).InstancedMesh(geom, mat, rec.items.length)
    ;(mesh.instanceMatrix as any).setUsage((THREE as any).DynamicDrawUsage)

    const dummy = new (THREE as any).Object3D()
    let i = 0
    for (const it of rec.items) {
      // center boxes in their stud footprint
      const cx = (it.x + rec.w / 2) * s
      const cy = (it.y + rec.h / 2) * s
      dummy.position.set(cx, cy, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i++, (dummy as any).matrix)
    }
    ;(mesh as any).computeBoundingSphere?.()
    group.add(mesh)
  }

  scene.add(group)
  // After building, frame the camera & controls around the content
  frameToContent()
}

function resize() {
  if (!renderer || !camera || !host.value) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function animate() {
  if (!renderer || !scene || !camera) return
  controls?.update()
  renderer.render(scene, camera)
  raf = requestAnimationFrame(animate)
}

onMounted(() => {
  if (!host.value) return
  scene = new (THREE as any).Scene()
  scene.background = new (THREE as any).Color('#0b0b0b')

  const w = host.value.clientWidth || 800
  const h = host.value.clientHeight || 600

  camera = new (THREE as any).PerspectiveCamera(45, w / h, 0.1, 10000)
  renderer = new (THREE as any).WebGLRenderer({ antialias: true })
  host.value.appendChild(renderer.domElement)
  resize()

  // Lights
  const amb = new (THREE as any).AmbientLight(0xffffff, 0.6)
  const dir = new (THREE as any).DirectionalLight(0xffffff, 0.8)
  dir.position.set(1, 1, 2)
  scene.add(amb, dir)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  // Keep interaction mostly top-down; allow gentle orbit
  controls.maxPolarAngle = Math.PI / 2.1
  // Tweak navigation feel
  controls.minDistance = 10
  controls.maxDistance = 2000
  controls.enablePan = true
  controls.panSpeed = 0.3

  // Initial frame
  frameToContent()

  buildGroup()
  animate()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  controls?.dispose()
  renderer?.dispose()
  if (host.value && renderer) host.value.removeChild(renderer.domElement)
  scene = null; camera = null; renderer = null; controls = null; group = null
})

// Rebuild on layer change quickly; on bricks change when a new tiling result arrives
watch(() => props.visibleLayers, () => requestAnimationFrame(buildGroup))
watch(() => props.bricks, () => requestAnimationFrame(buildGroup))

// Frame camera and controls to fit current group content
function frameToContent() {
  if (!camera || !controls) return
  // Compute bounds from group if available; fallback to bricks extents
  const s = props.studSize ?? 1
  let box: any
  if (group && group.children && group.children.length) {
    box = new (THREE as any).Box3().setFromObject(group)
  } else {
    const min = new (THREE as any).Vector3(0, 0, 0)
    const maxX = Math.max(1, ...props.bricks.map(b => b.x + b.w)) * s
    const maxY = Math.max(1, ...props.bricks.map(b => b.y + b.h)) * s
    const max = new (THREE as any).Vector3(maxX, maxY, s)
    box = new (THREE as any).Box3(min, max)
  }
  const center = box.getCenter(new (THREE as any).Vector3())
  const sizeV = box.getSize(new (THREE as any).Vector3())
  const maxSize = Math.max(sizeV.x, sizeV.y)
  const fov = (camera.fov ?? 45) * Math.PI / 180
  const dist = (maxSize / 2) / Math.tan(fov / 2)
  // Place camera slightly offset for a top-down-ish feel
  const eye = new (THREE as any).Vector3(center.x, center.y - dist * 0.9, dist * 1.1)
  camera.position.copy(eye)
  controls.target.copy(center)
  camera.near = Math.max(0.1, dist / 100)
  camera.far = Math.max(1000, dist * 10)
  camera.updateProjectionMatrix()
  // Adjust navigation ranges relative to content size
  controls.minDistance = Math.max(2, maxSize * 0.3)
  controls.maxDistance = Math.max(controls.minDistance + 1, maxSize * 3)
}
</script>
