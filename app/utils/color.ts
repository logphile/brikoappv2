export function rgbToLab([r, g, b]: [number, number, number]) {
  // Quick and dirty sRGB -> Lab (stub)
  const toLinear = (u: number) => (u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4))
  const R = toLinear(r / 255), G = toLinear(g / 255), B = toLinear(b / 255)
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505
  const xr = X / 0.95047, yr = Y / 1.0, zr = Z / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(xr), fy = f(yr), fz = f(zr)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)] as [number, number, number]
}

export function deltaE(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2])
}
