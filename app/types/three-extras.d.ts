declare module 'three/examples/jsm/controls/OrbitControls' {
  export class OrbitControls {
    constructor(object: any, domElement?: HTMLElement)
    enableDamping: boolean
    minDistance: number
    maxDistance: number
    enablePan: boolean
    update(): void
    dispose(): void
  }
}
