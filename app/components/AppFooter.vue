<template>
  <footer class="mt-24" aria-label="Site footer">
    <!-- Mint gradient hairline -->
    <div class="h-px w-full bg-gradient-to-r from-transparent via-mint/40 to-transparent"></div>

    <div class="bg-ink/90">
      <div class="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        <!-- Top row -->
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <!-- Utility links -->
          <nav class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
            <NuxtLink to="/privacy" class="footer-link">Privacy</NuxtLink>
            <NuxtLink to="/legal#terms" class="footer-link">Terms</NuxtLink>
            <a href="/sitemap.xml" class="footer-link">Sitemap</a>
          </nav>

          <!-- Copyright -->
          <p class="text-sm text-white/60">© {{ year }} Briko</p>
        </div>

        <!-- Disclaimer -->
        <p class="mt-6 text-center text-xs leading-relaxed text-white/55 max-w-5xl mx-auto">
          Briko is an independent tool — not affiliated with, endorsed by, or associated with the LEGO® Group.
          LEGO® is a trademark of the LEGO Group of companies.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped lang="postcss">
.footer-link{
  /* modern link affordance + accessibility */
  @apply hover:text-white hover:underline underline-offset-4 decoration-2 decoration-mint/70
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/50 rounded;
}
</style>
