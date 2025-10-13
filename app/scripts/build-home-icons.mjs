// scripts/build-home-icons.mjs
// Vendor selected Material Symbols as local Vue SFCs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Resolve installed icon set path robustly under pnpm
const pkgPath = require.resolve('@iconify-json/material-symbols/package.json')
const ICONS_DIR = resolve(dirname(pkgPath), 'icons')
const ICONS_JSON = resolve(dirname(pkgPath), 'icons.json')
const OUT_DIR = resolve(__dirname, '../components/icons')

mkdirSync(OUT_DIR, { recursive: true })

// Desired map (component name -> icon json name)
const MAP = {
  IconUpload: 'upload-rounded',
  IconTune: 'tune-rounded',
  IconAuto: 'auto-awesome-rounded',
  IconBolt: 'bolt-rounded',
  IconPalette: 'palette',
  IconPhoto: 'photo-library-rounded',
  IconLayers: 'layers-rounded',
  IconDownload: 'download-rounded',
  IconReceipt: 'receipt-long-rounded'
}

// Fallbacks for subsets that omit some variants
const FALLBACKS = {}

const header = (name) => `
<template>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" role="img">
    <!-- ${name} -->
`

const footer = `
  </svg>
</template>
`

// Prefer reading from the aggregated icons.json (modern @iconify-json packages)
const iconsIndex = existsSync(ICONS_JSON)
  ? JSON.parse(readFileSync(ICONS_JSON, 'utf8'))
  : null

function readIconBody(iconName) {
  const tryNames = [iconName, FALLBACKS[iconName]].filter(Boolean)
  if (iconsIndex && iconsIndex.icons) {
    for (const n of tryNames) {
      const rec = iconsIndex.icons[n]
      if (rec && rec.body) return { body: rec.body, used: n }
    }
  }
  // Fallback to per-file JSON if present (older packages)
  for (const n of tryNames) {
    const p = join(ICONS_DIR, `${n}.json`)
    if (existsSync(p)) {
      const raw = JSON.parse(readFileSync(p, 'utf8'))
      if (raw && raw.body) return { body: raw.body, used: n }
    }
  }
  throw new Error(`Icon not found in set: ${iconName} (tried: ${tryNames.join(', ')})`)
}

for (const [component, iconName] of Object.entries(MAP)) {
  const { body, used } = readIconBody(iconName)
  const vue = header(used) + body + footer
  writeFileSync(resolve(OUT_DIR, `${component}.vue`), vue, 'utf8')
  console.log(`✓ wrote ${component}.vue from ${used}`)
}
console.log('Done.')
