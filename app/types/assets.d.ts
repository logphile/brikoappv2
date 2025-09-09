declare module '*.ttf?base64' {
  const data: string
  export default data
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.png?url' {
  const src: string
  export default src
}
