// Generate raster favicon/icon variants from SVGs using sharp and to-ico
// Usage:
//   npm i -D sharp to-ico
//   node scripts/generate-icons.mjs

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = resolve(__dirname, '..', 'public')

const DARK_SVG = resolve(pub, 'favicon-dark.svg')
const LIGHT_SVG = resolve(pub, 'favicon-light.svg')

async function rasterize(svgPath, size) {
  return sharp(svgPath).resize(size, size, { fit: 'contain' }).png({ compressionLevel: 9 }).toBuffer()
}

async function write(filePath, buf) {
  await fs.writeFile(filePath, buf)
  console.log('✓', filePath.replace(process.cwd(), ''))
}

async function main() {
  // Ensure inputs exist
  await fs.access(DARK_SVG)
  await fs.access(LIGHT_SVG)

  // Favicons dark
  await write(resolve(pub, 'favicon-16.png'), await rasterize(DARK_SVG, 16))
  await write(resolve(pub, 'favicon-32.png'), await rasterize(DARK_SVG, 32))
  await write(resolve(pub, 'favicon-48.png'), await rasterize(DARK_SVG, 48))

  // Favicons light
  await write(resolve(pub, 'favicon-16-light.png'), await rasterize(LIGHT_SVG, 16))
  await write(resolve(pub, 'favicon-32-light.png'), await rasterize(LIGHT_SVG, 32))

  // Apple touch icon (single version)
  await write(resolve(pub, 'apple-touch-icon-180.png'), await rasterize(DARK_SVG, 180))

  // Android Chrome icons
  await write(resolve(pub, 'android-chrome-192.png'), await rasterize(DARK_SVG, 192))
  await write(resolve(pub, 'android-chrome-512.png'), await rasterize(DARK_SVG, 512))

  // Maskable: add ~12% safe padding
  const target = 512
  const inner = Math.round(target * 0.76) // 12% padding each side → inner ~76%
  const icon = await rasterize(DARK_SVG, inner)
  const bg = sharp({ create: { width: target, height: target, channels: 4, background: '#111827' } })
  const composed = await bg
    .composite([{ input: icon, left: Math.floor((target - inner) / 2), top: Math.floor((target - inner) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer()
  await write(resolve(pub, 'maskable-512.png'), composed)

  // ICO from 16 and 32
  const icoBuf = await toIco([
    await fs.readFile(resolve(pub, 'favicon-16.png')),
    await fs.readFile(resolve(pub, 'favicon-32.png'))
  ])
  await write(resolve(pub, 'favicon.ico'), icoBuf)

  console.log('All icons generated.')
}

main().catch(err => { console.error(err); process.exit(1) })
// T E S T