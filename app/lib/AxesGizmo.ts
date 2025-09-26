// lib/AxesGizmo.ts
import * as THREE from 'three'

export class AxesGizmo {
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, 0.01, 10)
  private size = 96 // px
  private padding = 12
  private root = new THREE.Group()
  private base: any | null = null

  constructor() {
    const axes = new THREE.AxesHelper(0.7)
    this.root.add(axes)

    const cone = new THREE.ConeGeometry(0.08, 0.18, 12)
    const mX = new THREE.MeshBasicMaterial({ color: 0xff5555 })
    const mY = new THREE.MeshBasicMaterial({ color: 0x55ff55 })
    const mZ = new THREE.MeshBasicMaterial({ color: 0x5599ff })

    const cx = new THREE.Mesh(cone, mX)
    cx.position.set(0.8, 0, 0)
    cx.rotation.z = -Math.PI / 2
    const cy = new THREE.Mesh(cone, mY)
    cy.position.set(0, 0.8, 0)
    const cz = new THREE.Mesh(cone, mZ)
    cz.position.set(0, 0, 0.8)
    cz.rotation.x = Math.PI / 2

    this.root.add(cx, cy, cz)

    // Dark base plate behind gizmo for contrast
    const baseGeo = new THREE.PlaneGeometry(1.6, 1.6)
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x343434, transparent: true, opacity: 0.6 })
    this.base = new THREE.Mesh(baseGeo, baseMat)
    ;(this.base as any).position.set(0, 0, -0.12)
    this.scene.add(this.base)

    // Yellow axis labels X/Y/Z
    const makeLabel = (txt: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = 64; canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0,0,64,64)
      ctx.fillStyle = '#FFD808'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(txt, 32, 32)
      const tex = new THREE.CanvasTexture(canvas)
      tex.needsUpdate = true
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const spr = new THREE.Sprite(mat)
      spr.scale.set(0.35, 0.35, 0.35)
      return spr
    }
    const lx = makeLabel('X'); lx.position.set(0.95, 0, 0)
    const ly = makeLabel('Y'); ly.position.set(0, 0.95, 0)
    const lz = makeLabel('Z'); lz.position.set(0, 0, 0.95)
    this.root.add(lx, ly, lz)

    this.scene.add(this.root)
    this.camera.position.set(1.2, 1.2, 1.2)
    this.camera.lookAt(0, 0, 0)
  }

  /** Call every frame with the main camera to sync orientation. */
  syncFrom(mainCamera: any) {
    ;(this.root as any).quaternion.copy((mainCamera as any).quaternion).invert()
  }

  /** Render into a small corner of the canvas. */
  render(renderer: any) {
    const { domElement } = renderer
    const pr = renderer.getPixelRatio ? renderer.getPixelRatio() : (window.devicePixelRatio || 1)
    const w = domElement.width / pr
    const h = domElement.height / pr

    // Bottom-left corner inside the canvas
    const x = this.padding
    const y = this.padding

    renderer.clearDepth()
    renderer.setScissorTest(true)
    renderer.setViewport(x, y, this.size, this.size)
    renderer.setScissor(x, y, this.size, this.size)
    renderer.render(this.scene, this.camera)
    renderer.setScissorTest(false)
    // restore viewport to full
    renderer.setViewport(0, 0, w, h)
  }
}
