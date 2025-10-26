<template>
  <footer class="border-t border-black/10 bg-[#FFD808]">
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

    <!-- ONE container for everything -->
    <div class="page-wrap text-[#343434] text-[14px] md:text-[15px]">
      <!-- Columns -->
      <div class="footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center lg:justify-items-start py-10">
        <!-- Column: Build -->
        <section>
          <div class="footer-head">Build</div>
          <ul class="footer-links">
            <li><FooterBrick to="/mosaic"  label="Photo to Bricks" /></li>
            <li v-if="cfg?.features?.builder3d"><FooterBrick to="/voxel" label="3D Builder" /></li>
            <li><FooterBrick to="/avatar"  label="Brick Yourself" /></li>
            <li><FooterBrick to="/studio"  label="Briko Studio" /></li>
          </ul>
        </section>

        <!-- Column: Learn -->
        <section>
          <div class="footer-head">Learn</div>
          <ul class="footer-links">
            <li><FooterBrick to="/how-it-works"   label="Docs" /></li>
            <li><FooterBrick to="#"   label="Blog" /></li>
            <li><FooterBrick to="#"   label="Help Center" /></li>
            <li><FooterBrick to="/pricing" label="Pricing" /></li>
          </ul>
        </section>

        <!-- Column: Company -->
        <section>
          <div class="footer-head">Company</div>
          <ul class="footer-links">
            <li><FooterBrick to="mailto:hello@briko.app" label="Contact" /></li>
            <li><FooterBrick to="/gallery" label="Community Gallery" /></li>
            <li><FooterBrick to="#" label="Changelog" /></li>
            <li><FooterBrick to="#" label="Status" /></li>
          </ul>
        </section>

        <!-- Column: Legal -->
        <section>
          <div class="footer-head">Legal</div>
          <ul class="footer-links">
            <li><FooterBrick to="/privacy" label="Privacy" /></li>
            <li><FooterBrick to="/terms"   label="Terms" /></li>
            <li><FooterBrick to="/sitemap.xml" label="Sitemap" /></li>
          </ul>
        </section>
      </div>

      <!-- Divider (optional) -->
      <hr class="my-6 border-black/10" />

      <!-- Legal line -->
      <p class="legal-line text-center text-xs md:text-sm opacity-80 pb-10">
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
