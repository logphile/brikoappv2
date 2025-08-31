/// <reference types="node" />
/// <reference types="nuxt" />

declare module '*.svg?url' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}
