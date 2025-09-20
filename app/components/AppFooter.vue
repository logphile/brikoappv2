<template>
  <footer class="border-t border-white/10 bg-black/20">
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

    <!-- Stacked link columns -->
    <nav aria-label="Footer" class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Column: Build -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-white">Build</h3>
          <ul class="space-y-1.5">
            <li><FooterBrick to="/mosaic"  label="Photo to Bricks" /></li>
            <li><FooterBrick to="/voxel" label="3D Builder" /></li>
            <li><FooterBrick to="/avatar"  label="Brick Yourself" /></li>
            <li><FooterBrick to="/studio"  label="Briko Studio" /></li>
          </ul>
        </section>

        <!-- Column: Learn -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-white">Learn</h3>
          <ul class="space-y-1.5">
            <li><FooterBrick to="/how-it-works"   label="Docs" /></li>
            <li><FooterBrick to="#"   label="Blog" /></li>
            <li><FooterBrick to="#"   label="Help Center" /></li>
            <li><FooterBrick to="/pricing" label="Pricing" /></li>
          </ul>
        </section>

        <!-- Column: Company -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-white">Company</h3>
          <ul class="space-y-1.5">
            <li><FooterBrick to="mailto:hello@briko.app" label="Contact" /></li>
            <li><FooterBrick to="/gallery" label="Community Gallery" /></li>
            <li><FooterBrick to="#" label="Changelog" /></li>
            <li><FooterBrick to="#" label="Status" /></li>
          </ul>
        </section>

        <!-- Column: Legal -->
        <section>
          <h3 class="mb-3 font-brand font-bold text-base text-white">Legal</h3>
          <ul class="space-y-1.5">
            <li><FooterBrick to="/privacy" label="Privacy" /></li>
            <li><FooterBrick to="/terms"   label="Terms" /></li>
            <li><FooterBrick to="/sitemap.xml" label="Sitemap" /></li>
          </ul>
        </section>
      </div>

      <!-- Bottom fine print -->
      <div class="mt-10 pt-6 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-white/60">
        <p>© {{ new Date().getFullYear() }} Briko</p>
        <p class="text-center sm:text-left">
          Briko is an independent tool — not affiliated with, endorsed by, or associated with the LEGO® Group.
          LEGO® is a trademark of the LEGO Group of companies.
        </p>
      </div>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import FooterBrick from '@/components/FooterBrick.vue'
</script>
