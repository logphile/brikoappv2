<script setup lang="ts">
import { useHead } from 'nuxt/app'
useHead({
  title: 'How it works — Briko',
  meta: [
    { name: 'description', content: 'Upload → Preview → Export. See how Briko turns images into LEGO-style mosaics or voxels with parts lists and build steps.' },
    { property: 'og:title', content: 'How Briko Works' },
    { property: 'og:description', content: 'Fast previews, smart tiling, and practical exports.' }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-16 prose prose-invert">
    <h1>How it works</h1>
    <p>Briko’s pipeline is optimized for speed and clarity, using Web Workers, Three.js, and a LEGO-like palette.</p>

    <h2>Mosaic</h2>
    <ol>
      <li><strong>Upload.</strong> We downscale and normalize the image to your chosen stud size.</li>
      <li><strong>Palette map.</strong> Each pixel is mapped to the nearest LEGO-style color (LAB space; optional dithering).</li>
      <li><strong>Greedy tiler.</strong> We fuse studs into 2×N and 1×N plates by color and region to reduce parts and cost.</li>
      <li><strong>Preview.</strong> Toggle seams/legend, view part count and rough price.</li>
      <li><strong>Export.</strong> Download PDF build steps, CSV BOM, and PNG plan.</li>
    </ol>

    <h3>Tips</h3>
    <ul>
      <li>Logos and high-contrast photos tile best. Try reducing “Max plate” if fine detail is lost.</li>
      <li>For posters, export PNG and print large; for builds, use the PDF steps.</li>
    </ul>

    <h2>Voxel (3D)</h2>
    <ol>
      <li><strong>Generate.</strong> We voxelize with your parameters and show a 3D InstancedMesh preview.</li>
      <li><strong>Layers.</strong> Slide through Z-layers and export layer snapshots to PDF.</li>
      <li><strong>Save & share.</strong> Keep projects in your account and publish a read-only link.</li>
    </ol>

    <h2>Avatar</h2>
    <ol>
      <li><strong>Headshot in.</strong> Choose palette and background (keep/solid/transparent).</li>
      <li><strong>Stud render.</strong> We simulate plastic sheen for a LEGO-like look.</li>
      <li><strong>Export.</strong> One-click PNG; save/share optional.</li>
    </ol>

    <h2>What Briko is (and isn’t)</h2>
    <ul>
      <li>We generate <em>plans and previews</em>, not official LEGO instructions.</li>
      <li>Prices are approximate; real-world availability varies by seller and color.</li>
      <li><strong>Not affiliated</strong> with the LEGO Group.</li>
    </ul>

    <p class="opacity-70 text-sm">Questions? <a href="mailto:support@briko.app">support@briko.app</a></p>
  </main>
</template>

<style scoped>
.prose :where(h1,h2,h3){ scroll-margin-top: 96px; }
</style>
