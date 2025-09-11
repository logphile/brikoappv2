// builders3d.ts
// High-level mesh builders for Briko 3D modes.
// Depends on legoPalette.ts and studGeometry.ts

import * as THREE from 'three'
import { createStudGeometry, type StudOptions } from '@/lib/studGeometry'
import { paletteIndexToThreeColor } from '@/lib/legoPalette'

export type BuildBounds = { min: THREE.Vector3; max: THREE.Vector3; size: THREE.Vector3 }
export type BuildResult = { mesh: THREE.InstancedMesh; bounds: BuildBounds; dispose: () => void }

export type MosaicOpts = {
  pitch?: number // spacing between studs (world units)
  center?: boolean // center the grid around origin
  stud?: boolean // show stud nub
  studKind?: 'tile' | 'plate' | 'brick'
  layerZ?: number // mosaic layer Z (e.g., current slice)
  mask?: Uint8Array | null // optional 0/1 mask (skip=0) for hollow shell
}

export type ReliefOpts = {
  pitch?: number
  center?: boolean
  stud?: boolean // if true: columns use brick/plate stud caps; if false: smooth column
  minH?: number // min column height (stud units)
  maxH?: number // max column height (stud units)
}

export type OverlayUpdater = (info: {
  mode: 'mosaic' | 'hollow' | 'relief'
  bricks: number
  layers?: { shown: number; total: number }
  colorsUsed: number
}) => void

/* ------------------------------ Utilities ------------------------------ */

function computeBoundsForGrid(
  width: number,
  height: number,
  pitch: number,
  zMin: number,
  zMax: number,
  center: boolean
): BuildBounds {
  const sizeX = width * pitch
  const sizeY = height * pitch
  const min = new THREE.Vector3(center ? -sizeX / 2 : 0, center ? -sizeY / 2 : 0, zMin)
  const max = new THREE.Vector3(center ? sizeX / 2 : sizeX, center ? sizeY / 2 : sizeY, zMax)
  const size = new THREE.Vector3().subVectors(max, min)
  return { min, max, size }
}

/** Fit a perspective camera & OrbitControls target to the bounds. */
export function fitCameraToBounds(
  camera: THREE.PerspectiveCamera,
  controls: any, // OrbitControls
  bounds: BuildBounds,
  pad = 1.2 // padding multiplier
) {
  const center = new THREE.Vector3().addVectors(bounds.min, bounds.max).multiplyScalar(0.5)
  const size = bounds.size.clone().multiplyScalar(pad)

  // pick the largest dimension as fit basis
  const maxDim = Math.max(size.x, size.y, size.z || size.x)
  const fov = camera.fov * (Math.PI / 180)
  let distance = (maxDim / 2) / Math.tan(fov / 2)

  // Aim from iso-ish direction
  const dir = new THREE.Vector3(1, 1, 0.8).normalize()
  const pos = center.clone().addScaledVector(dir, distance)
  camera.position.copy(pos)
  camera.near = Math.max(0.01, distance / 100)
  camera.far = distance * 20
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}

/** Convert palette index to THREE.Color, cached to reduce allocations. */
const colorCache: THREE.Color[] = []
function colorFromIndex(idx: number): THREE.Color {
  return (colorCache[idx] ??= new THREE.Color()).setRGB(
    paletteIndexToThreeColor(idx).r,
    paletteIndexToThreeColor(idx).g,
    paletteIndexToThreeColor(idx).b
  )
}

/* --------------------------- Layered Mosaic --------------------------- */

/**
 * Build a flat stud layer (Layered Mosaic).
 * - One instance per pixel (unless masked out).
 * - All instances placed at Z = layerZ.
 */
export function buildLayeredMosaic(
  indices: Uint16Array, // palette index per pixel (w*h)
  width: number,
  height: number,
  {
    pitch = 1,
    center = true,
    stud = false,
    studKind = 'tile',
    layerZ = 0,
    mask = null
  }: MosaicOpts,
  overlay?: OverlayUpdater
): BuildResult {
  const studGeo = createStudGeometry({ kind: studKind, stud, pitch } as StudOptions)
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true
  })

  // Count visible pixels
  let count = 0
  if (mask) {
    for (let i = 0; i < indices.length; i++) if (mask[i]) count++
  } else count = indices.length

  const mesh = new THREE.InstancedMesh(studGeo, material, count)
  const m4 = new THREE.Matrix4()
  const v3 = new THREE.Vector3()

  const startX = center ? (-(width - 1) * pitch) / 2 : 0
  const startY = center ? (-(height - 1) * pitch) / 2 : 0

  let iInst = 0
  const usedColors = new Set<number>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (mask && !mask[idx]) continue

      v3.set(startX + x * pitch, startY + y * pitch, layerZ)
      m4.makeTranslation(v3.x, v3.y, v3.z)
      mesh.setMatrixAt(iInst, m4)

      const pi = indices[idx]
      usedColors.add(pi)
      mesh.setColorAt(iInst, colorFromIndex(pi))
      iInst++
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  ;(mesh.instanceColor as any)!.needsUpdate = true

  const bounds = computeBoundsForGrid(
    width,
    height,
    pitch,
    layerZ,
    layerZ + (studGeo.boundingBox?.max.z ?? 0),
    center
  )

  overlay?.({
    mode: 'mosaic',
    bricks: count,
    layers: { shown: 1, total: 1 }, // per-slice render; your UI can display “0–N”
    colorsUsed: usedColors.size
  })

  return {
    mesh,
    bounds,
    dispose: () => {
      studGeo.dispose()
      material.dispose()
      mesh.dispose()
    }
  }
}

/* --------------------------- Layered Hollow --------------------------- */

/**
 * Build a hollow shell:
 * - Top layer fully filled at Z = topZ
 * - Side walls from z=0..topZ (thin vertical ring). For simplicity here,
 *   we only render the top layer at given layerZ and the perimeter at the same Z.
 *   For multi-layer stepping, rebuild with different layerZ each time.
 */
export function buildLayeredHollow(
  indices: Uint16Array,
  width: number,
  height: number,
  { pitch = 1, center = true, stud = false, studKind = 'tile', layerZ = 0 }: MosaicOpts,
  overlay?: OverlayUpdater
): BuildResult {
  const studGeo = createStudGeometry({ kind: studKind, stud, pitch } as StudOptions)
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true
  })

  // Perimeter mask for current layer
  const isPerimeter = (x: number, y: number) => x === 0 || y === 0 || x === width - 1 || y === height - 1

  // Count instances (top + perimeter)
  let count = width * height + (width * 2 + (height - 2) * 2) // roof + side ring

  const mesh = new THREE.InstancedMesh(studGeo, material, count)
  const m4 = new THREE.Matrix4()
  const v3 = new THREE.Vector3()
  const startX = center ? (-(width - 1) * pitch) / 2 : 0
  const startY = center ? (-(height - 1) * pitch) / 2 : 0

  let iInst = 0
  const usedColors = new Set<number>()

  // Roof layer
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      v3.set(startX + x * pitch, startY + y * pitch, layerZ)
      m4.makeTranslation(v3.x, v3.y, v3.z)
      mesh.setMatrixAt(iInst, m4)
      const pi = indices[idx]
      usedColors.add(pi)
      mesh.setColorAt(iInst, colorFromIndex(pi))
      iInst++
    }

  // Side ring at same Z (suggests shell)
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (!isPerimeter(x, y)) continue
      const idx = y * width + x
      v3.set(startX + x * pitch, startY + y * pitch, layerZ)
      m4.makeTranslation(v3.x, v3.y, v3.z)
      mesh.setMatrixAt(iInst, m4)
      const pi = indices[idx]
      usedColors.add(pi)
      mesh.setColorAt(iInst, colorFromIndex(pi))
      iInst++
    }

  mesh.instanceMatrix.needsUpdate = true
  ;(mesh.instanceColor as any)!.needsUpdate = true

  const bounds = computeBoundsForGrid(
    width,
    height,
    pitch,
    layerZ,
    layerZ + (studGeo.boundingBox?.max.z ?? 0),
    center
  )

  overlay?.({ mode: 'hollow', bricks: count, layers: { shown: 1, total: 1 }, colorsUsed: usedColors.size })

  return {
    mesh,
    bounds,
    dispose: () => {
      studGeo.dispose()
      material.dispose()
      mesh.dispose()
    }
  }
}

/* --------------------------- Relief (height-map) --------------------------- */

/**
 * Build a relief where column height varies with luminance.
 * - Provide either `luminance01` (0..1 per pixel) or we can derive it simple from indices.
 */
export function buildReliefHeightmap(
  indices: Uint16Array, // still used for color
  width: number,
  height: number,
  luminance01: Float32Array, // w*h luminance in [0..1]
  { pitch = 1, center = true, stud = true, minH = 1, maxH = 12 }: ReliefOpts,
  overlay?: OverlayUpdater
): BuildResult {
  // For relief we want a column look: use brick kind for readable height
  const studGeo = createStudGeometry({ kind: 'brick', stud, pitch })
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true
  })

  const mesh = new THREE.InstancedMesh(studGeo, material, width * height)
  const m4 = new THREE.Matrix4()
  const v3 = new THREE.Vector3()
  const startX = center ? (-(width - 1) * pitch) / 2 : 0
  const startY = center ? (-(height - 1) * pitch) / 2 : 0

  const usedColors = new Set<number>()
  let zMax = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const L = luminance01[idx] // 0..1
      const h = Math.round(minH + L * (maxH - minH)) // stud units
      const z = h // Z-up stack; stud geom base is at 0 with its own height
      zMax = Math.max(zMax, z)

      v3.set(startX + x * pitch, startY + y * pitch, z)
      m4.makeTranslation(v3.x, v3.y, v3.z)
      mesh.setMatrixAt(idx, m4)

      const pi = indices[idx]
      usedColors.add(pi)
      mesh.setColorAt(idx, colorFromIndex(pi))
    }
  }

  mesh.instanceMatrix.needsUpdate = true
  ;(mesh.instanceColor as any)!.needsUpdate = true

  const bounds = computeBoundsForGrid(width, height, pitch, 0, zMax + (studGeo.boundingBox?.max.z ?? 0), center)

  overlay?.({ mode: 'relief', bricks: width * height, colorsUsed: usedColors.size })

  return {
    mesh,
    bounds,
    dispose: () => {
      studGeo.dispose()
      material.dispose()
      mesh.dispose()
    }
  }
}

/** Convert ImageData to luminance (0..1) for Relief builder. */
export function toLuminance01(imgData: ImageData): Float32Array {
  const out = new Float32Array(imgData.width * imgData.height)
  const d = imgData.data
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const r = d[i] / 255
    const g = d[i + 1] / 255
    const b = d[i + 2] / 255
    // Rec. 709 luminance
    out[j] = 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  return out
}
