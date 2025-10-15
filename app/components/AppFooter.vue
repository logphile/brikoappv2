<template>
  <footer class="border-t border-black/10 bg-[#FFD808] py-12">
    <!-- Top rail (optional CTA) -->
    <!--
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div class="soft-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 class="font-brand font-bold text-[clamp(24px,3.6vw,32px)] leading-tight">
          Ready to build something awesome?
        </h2>
        <NuxtLink to="/mosaic" class="u-cta">Try Photo to Bricks</NuxtLink>
      </div>
    </div>
    -->

    <!-- Shared container for columns + legal -->
    <div class="mx-auto max-w-6xl px-4 sm:px-6 text-[#343434] text-[14px] md:text-[15px]">
      <div class="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-start">
        <!-- Column: Build -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-[#343434]">Build</h3>
          <ul class="space-y-3">
            <li><FooterBrick to="/mosaic"  label="Photo to Bricks" /></li>
            <li v-if="cfg?.features?.builder3d"><FooterBrick to="/voxel" label="3D Builder" /></li>
            <li><FooterBrick to="/avatar"  label="Brick Yourself" /></li>
            <li><FooterBrick to="/studio"  label="Briko Studio" /></li>
          </ul>
        </section>

        <!-- Column: Learn -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-[#343434]">Learn</h3>
          <ul class="space-y-3">
            <li><FooterBrick to="/how-it-works"   label="Docs" /></li>
            <li><FooterBrick to="#"   label="Blog" /></li>
            <li><FooterBrick to="#"   label="Help Center" /></li>
            <li><FooterBrick to="/pricing" label="Pricing" /></li>
          </ul>
        </section>

        <!-- Column: Company -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-[#343434]">Company</h3>
          <ul class="space-y-3">
            <li><FooterBrick to="mailto:hello@briko.app" label="Contact" /></li>
            <li><FooterBrick to="/gallery" label="Community Gallery" /></li>
            <li><FooterBrick to="#" label="Changelog" /></li>
            <li><FooterBrick to="#" label="Status" /></li>
          </ul>
        </section>

        <!-- Column: Legal -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-[#343434]">Legal</h3>
          <ul class="space-y-3">
            <li><FooterBrick to="/privacy" label="Privacy" /></li>
            <li><FooterBrick to="/terms"   label="Terms" /></li>
            <li><FooterBrick to="/sitemap.xml" label="Sitemap" /></li>
          </ul>
        </section>
      </div>

      <!-- Bottom fine print -->
      <p class="mt-10 text-center text-xs text-[#343434]/75">
        Briko is an independent tool — not affiliated with, endorsed by, or associated with the LEGO® Group. LEGO® is a
        trademark of the LEGO Group of companies.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import FooterBrick from '@/components/FooterBrick.vue'
import { useRuntimeConfig } from 'nuxt/app'
const { public: cfg } = useRuntimeConfig() as any
</script>
