<template>
  <section class="mt-12">
    <h2 class="mb-6 text-2xl font-semibold tracking-tight">FAQ</h2>

    <div v-for="(f, i) in faqs" :key="i" class="border-t border-black/10 py-5">
      <details class="group">
        <summary
          class="cursor-pointer text-lg font-semibold text-[#111827] hover:text-[#00E5A0] transition-colors"
        >
          {{ f.q }}
        </summary>
        <p class="mt-2 text-sm leading-relaxed text-[#111827]/80 opacity-0 group-open:opacity-100 transition-opacity duration-200 ease-out">
          {{ f.a }}
        </p>
      </details>
    </div>
  </section>
  
</template>

<script setup lang="ts">
const faqs = [
  {
    q: "What image types are supported?",
    a: "JPEG, PNG, and WEBP work best. Briko automatically resizes and color-maps your image, so no need to prep it first.",
  },
  {
    q: "How accurate is the parts list?",
    a: "It reflects the chosen palette and tiling method. Briko doesn’t yet pull live marketplace data, but the counts are precise for each project’s layout and palette.",
  },
  {
    q: "Where do I buy the LEGO pieces for my project?",
    a: "You can find pieces on marketplaces such as BrickLink or Rebrickable. Briko’s cost estimates use BrickLink’s recent average prices—not live listings—and are meant as a general guide. Briko isn’t affiliated with or endorsed by the LEGO Group or BrickLink.",
  },
  {
    q: "Can I share my build?",
    a: "Yes. Save your project and set it to Public in your gallery. Others can view, remix, or export it, but your originals remain under your account.",
  },
  {
    q: "Can I upload any image?",
    a: "Almost any, as long as you own the rights or it’s free to use. Avoid copyrighted or inappropriate material—the community gallery is moderated.",
  },
  {
    q: "Will Briko ever be open source?",
    a: "Possibly. The goal is to keep the core free and add optional features later (like expanded 3D tools and live part sourcing). When the backend stabilizes, parts of the mosaic engine may be opened for community mods.",
  },
  {
    q: "Why don’t all colors match real LEGO bricks?",
    a: "Briko uses a reduced palette based on available LEGO colors. Some shades are approximations—close enough for a build, but not perfect under every light.",
  },
  {
    q: "Why does the 3D preview look different from the mosaic?",
    a: "They’re rendered with different materials and lighting. The mosaic prioritizes true color matching; the 3D preview adds depth and shading for realism.",
  },
]
</script>
