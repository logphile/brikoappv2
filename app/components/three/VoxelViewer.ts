import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class VoxelViewer {
  container: HTMLElement
  renderer!: any
  scene!: any
  camera!: any
  controls!: any
  material!: any
  w = 1; h = 1; d = 1
  private _animId = 0
  private _onResize: (() => void) | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.init()
  }

  private init() {
    this.scene = new THREE.Scene()

    const { clientWidth: cw, clientHeight: ch } = this.container
    this.camera = new THREE.PerspectiveCamera(50, Math.max(1, cw) / Math.max(1, ch || 1), 0.1, 20000)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(Math.max(1, cw), Math.max(1, ch || 1))
    this.renderer.setPixelRatio(Math.min(2, (window as any).devicePixelRatio || 1))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace as any
    this.renderer.toneMapping = THREE.NoToneMapping as any
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true

    // Basic material to guarantee visibility (you can switch to PBR later)
    this.material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, toneMapped: false })

    const animate = () => {
      this._animId = requestAnimationFrame(animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
    animate()

    this._onResize = () => {
      const { clientWidth, clientHeight } = this.container
      this.camera.aspect = Math.max(1, clientWidth) / Math.max(1, clientHeight || 1)
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(Math.max(1, clientWidth), Math.max(1, clientHeight || 1))
    }
    window.addEventListener('resize', this._onResize, { passive: true })
  }

  frame(w: number, h: number, d: number) {
    this.w = w; this.h = h; this.d = d
    const c = new THREE.Vector3(w / 2, h / 2, d / 2)
    this.controls.target.copy(c)
    const r = Math.max(w, h, d)
    this.camera.near = Math.max(0.1, r * 0.001)
    this.camera.far = Math.max(10, r * 20)
    this.camera.position.set(c.x + r * 1.2, c.y + r * 1.2, c.z + r * 2.2)
    this.camera.updateProjectionMatrix()
  }

  smokeOn() {
    // 16x16 colored cubes — proves renderer/camera/culling
    const gw = 16, gh = 16, gd = 1
    const geo = new THREE.BoxGeometry(1, 1, 1)
    const inst = new THREE.InstancedMesh(geo, this.material, gw * gh * gd)
    inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(gw * gh * gd * 3), 3)
    inst.frustumCulled = false
    const m = new THREE.Matrix4()
    const tmp = new THREE.Color()
    let i = 0
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      m.makeTranslation(x + 0.5, y + 0.5, 0.5)
      inst.setMatrixAt(i, m)
      tmp.setHex([0xff3366, 0x33ff66, 0x3366ff][x % 3]).convertSRGBToLinear()
      inst.setColorAt(i, tmp)
      i++
    }
    this.scene.add(inst)
    this.frame(gw, gh, gd)
    console.log('[DEBUG] smoke grid ready, instances:', i)
    return inst
  }

  basic() {
    this.material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, toneMapped: false })
  }

  pbr() {
    // add minimal lights and switch to PBR
    if (!this.scene.getObjectByName('dbgAmb')) {
      const amb = new THREE.AmbientLight(0xffffff, 0.4); amb.name = 'dbgAmb'; this.scene.add(amb)
      const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(50, 100, 50); dir.name = 'dbgDir'; this.scene.add(dir)
    }
    this.material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, roughness: 1, side: THREE.FrontSide })
  }

  wire() {
    (this.material as any).wireframe = !(this.material as any).wireframe
  }

  clipOff() {
    this.renderer.clippingPlanes = []
  }

  resetCam() {
    this.frame(this.w, this.h, this.d)
  }

  info() { console.log({ sceneChildren: this.scene.children.length, w: this.w, h: this.h, d: this.d }) }

  destroy() {
    if (this._animId) cancelAnimationFrame(this._animId)
    if (this._onResize) { window.removeEventListener('resize', this._onResize); this._onResize = null }
    // remove canvas
    const dom = this.renderer?.domElement
    try { this.renderer?.dispose() } catch {}
    if (dom && dom.parentElement) dom.parentElement.removeChild(dom)
  }
}
