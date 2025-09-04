<template>
  <Head>
    <Title>Legal — Briko</Title>
    <Meta name="description" content="Terms, Privacy, Pricing Disclaimer and Trademarks for Briko (BrickMOC Companion)." />
    <Meta property="og:title" content="Legal — Briko" />
    <Meta property="og:description" content="Terms, Privacy, Pricing Disclaimer and Trademarks." />
    <Meta property="og:url" content="https://briko.app/legal" />
    <Meta property="og:image" content="https://briko.app/og-default.png" />
    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" content="Legal — Briko" />
    <Meta name="twitter:description" content="Terms, Privacy, Pricing Disclaimer and Trademarks for Briko (BrickMOC Companion)." />
    <Meta name="twitter:image" content="https://briko.app/og-default.png" />
  </Head>
  <main class="mx-auto max-w-3xl px-6 py-12 text-white">
    <h1 class="text-3xl font-bold mb-6">Legal</h1>

    <nav class="text-sm text-white/70 mb-6">
      <a href="#terms" class="hover:text-white">Terms</a>
      <span class="mx-2">•</span>
      <a href="#privacy" class="hover:text-white">Privacy</a>
      <span class="mx-2">•</span>
      <a href="#pricing" class="hover:text-white">Pricing Disclaimer</a>
      <span class="mx-2">•</span>
      <a href="#trademark" class="hover:text-white">Trademarks</a>
    </nav>

    <section id="terms" class="prose prose-invert max-w-none">
      <h2>Terms of Use</h2>
      <p>
        Briko is a preview tool that helps you generate LEGO-style mosaics and voxel mockups and estimate
        parts usage and potential costs. You agree to use Briko for lawful purposes and to not violate any
        third-party rights. The service is provided “as is” without warranties of any kind. To the maximum
        extent permitted by law, Briko disclaims liability for any indirect, incidental, or consequential
        damages arising from your use of the service.
      </p>
      <p>
        Content you upload should be owned by you or used with permission. You are responsible for complying
        with any applicable laws, including intellectual property and privacy laws.
      </p>
    </section>

    <section id="privacy" class="prose prose-invert max-w-none mt-10">
      <h2>Privacy</h2>
      <p>
        We process images locally in your browser wherever possible (via Web Workers and WebGL/Canvas). If
        you sign in or share projects, limited metadata may be stored to provide your account and sharing
        features. We do not sell personal data. For questions or data requests, contact
        <a href="mailto:hello@briko.app">hello@briko.app</a>.
      </p>
    </section>

    <section id="pricing" class="prose prose-invert max-w-none mt-10">
      <h2>Pricing Disclaimer</h2>
      <p>{{ PRICE_ESTIMATE_LONG }}</p>
    </section>

    <section id="trademark" class="prose prose-invert max-w-none mt-10">
      <h2>Trademarks</h2>
      <p>{{ TRADEMARK_NOTICE_SHORT }}</p>
    </section>

    <p class="mt-12 text-xs text-white/50">Last updated: {{ new Date().toISOString().slice(0,10) }}</p>
  </main>
</template>

<script setup lang="ts">
import { PRICE_ESTIMATE_LONG, TRADEMARK_NOTICE_SHORT } from '@/lib/disclaimer'
</script>
