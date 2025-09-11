// studGeometry.ts
// Lightweight LEGO-esque stud/brick geometry factory for InstancedMesh.
// Z-up (base at Z=0, height toward +Z). Returns merged BufferGeometry.
// No external deps required; will use a tiny local merge util.

import * as THREE from 'three'

// ---------- Params & LEGO-ish proportions (normalized to 1 stud pitch) ----------
export type StudKind = 'tile' | 'plate' | 'brick'

export interface StudOptions {
  kind?: StudKind // 'tile' (flat top), 'plate' (1/3 brick), 'brick' (full)
  stud?: boolean // whether to include the little cylindrical nub
  pitch?: number // grid spacing; 1.0 = convenient for world units
  // Dimensions below are expressed as fractions of pitch.
  studDiameter?: number // ~4.8mm / 8.0mm ≈ 0.6 (we use 0.62 to read better)
  studHeight?: number // visual nub height on top
  tileHeight?: number // very thin tile; purely visual thickness
  plateHeight?: number // LEGO plate is ~1/3 the height of a brick
  brickHeight?: number // full brick height
  fillet?: number // small edge chamfer amount on the sides (0..0.2)
  radialSegments?: number // stud roundness; 16–24 is fine for InstancedMesh
  zUp?: boolean // force Z-up (default true)
}

const DEFAULTS: Required<StudOptions> = {
  kind: 'plate',
  stud: true,
  pitch: 1.0,
  studDiameter: 0.62,
  studHeight: 0.08,
  tileHeight: 0.06,
  plateHeight: 0.12,
  brickHeight: 0.36,
  fillet: 0.03,
  radialSegments: 20,
  zUp: true,
}

// ---------- Simple geometry merge utility (no external BufferGeometryUtils) ----------
function mergeGeometries(geoms: any[]): any {
  const merged = (THREE as any).BufferGeometryUtils
    ? (THREE as any).BufferGeometryUtils.mergeGeometries(geoms, true)
    : _mergeGeometriesLocal(geoms)
  return merged
}

// Local fallback if three-stdlib isn't available
function _mergeGeometriesLocal(geoms: any[]): any {
  // Ensure all share the same attributes
  const hasIndex = geoms.some((g) => g.index)
  const attributes = new Set<string>()
  geoms.forEach((g) => Object.keys(g.attributes).forEach((a) => attributes.add(a)))

  const result = new (THREE as any).BufferGeometry()
  const attrArrays: Record<string, number[]> = {}
  attributes.forEach((a) => (attrArrays[a] = []))

  const indexArray: number[] = []
  let vertexOffset = 0

  for (const g of geoms) {
    // attributes
    attributes.forEach((a) => {
      const attr = g.getAttribute(a) as any
      if (!attr) return
      const arr = attr.array as ArrayLike<number>
      for (let i = 0; i < arr.length; i++) (attrArrays[a] as number[]).push(arr[i] as number)
    })

    // index
    if (hasIndex) {
      const idx = g.index ? g.index.array : _makeTrivialIndex(g)
      for (let i = 0; i < (idx as any).length; i++) indexArray.push(((idx as any)[i] as number) + vertexOffset)
    }

    // update vertexOffset
    const pos = g.getAttribute('position') as any
    vertexOffset += pos.count
  }

  // build result
  attributes.forEach((a) => {
    const arr = new Float32Array(attrArrays[a])
    result.setAttribute(a, new (THREE as any).BufferAttribute(arr, (geoms[0].getAttribute(a) as any).itemSize))
  })
  if (hasIndex) result.setIndex(indexArray)

  result.computeVertexNormals()
  return result
}

function _makeTrivialIndex(g: any): number[] {
  const pos = g.getAttribute('position') as any
  const count = pos.count
  const idx: number[] = []
  for (let i = 0; i < count; i++) idx.push(i)
  return idx
}

// ---------- Primitive builders ----------
function roundedBoxXZ(sx: number, sy: number, sz: number, fillet: number): any {
  // Cheap “rounded” look: inset side faces with a small bevel strip.
  // For performance, we approximate using BoxGeometry + scale + normal recompute.
  const g = new (THREE as any).BoxGeometry(sx, sy, sz, 1, 1, 1)
  // Slight vertex push on edges to fake a chamfer: compress to create softer edge reads.
  const pos = g.getAttribute('position') as any
  const v = new (THREE as any).Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    // shrink a tad toward center on X/Y to hint bevel
    const fx = (sx - Math.max(0, sx - 2 * fillet)) / sx
    const fy = (sy - Math.max(0, sy - 2 * fillet)) / sy
    v.x *= 1 - fx * 0.08
    v.y *= 1 - fy * 0.08
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

function cylinderZ(radius: number, height: number, radialSegments: number): any {
  const g = new (THREE as any).CylinderGeometry(radius, radius, height, radialSegments, 1, false)
  // CylinderGeometry is Y-up; rotate to Z-up
  g.rotateX(Math.PI / 2)
  return g
}

// ---------- Main factory ----------
const cache = new Map<string, any>()

export function createStudGeometry(opts?: StudOptions): any {
  const o = { ...DEFAULTS, ...(opts || {}) }

  // Height by kind
  const bodyH = o.kind === 'tile' ? o.tileHeight : o.kind === 'brick' ? o.brickHeight : o.plateHeight

  const key = [
    o.kind,
    o.stud ? 1 : 0,
    o.pitch,
    o.studDiameter,
    o.studHeight,
    bodyH,
    o.fillet,
    o.radialSegments,
    o.zUp ? 1 : 0,
  ].join('|')

  const cached = cache.get(key)
  if (cached) return cached

  // Base body (square footprint 1x1 stud pitch)
  const body = roundedBoxXZ(o.pitch - o.fillet * 2, o.pitch - o.fillet * 2, bodyH, o.fillet)
  // Move base so it sits on Z=0
  body.translate(0, 0, bodyH / 2)

  const parts: any[] = [body]

  // Stud (nub) on top – only if requested and not a TILE
  if (o.stud && o.kind !== 'tile') {
    const r = (o.studDiameter * o.pitch) / 2
    const h = o.studHeight * o.pitch
    const stud = cylinderZ(r, h, o.radialSegments)
    stud.translate(0, 0, bodyH + h / 2)
    parts.push(stud)
  }

  // Merge, center XY at (0,0), Z base at 0 (already)
  const merged = mergeGeometries(parts)
  merged.computeBoundingBox()
  const bb = merged.boundingBox!
  // Center XY
  const cx = (bb.max.x + bb.min.x) * 0.5
  const cy = (bb.max.y + bb.min.y) * 0.5
  merged.translate(-cx, -cy, 0)

  // Ensure flat shading for nice brick look
  merged.computeVertexNormals()

  cache.set(key, merged)
  return merged
}
