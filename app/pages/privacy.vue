<script setup lang="ts">
const lastUpdated = 'Sept 2025'
</script>

<template>
  <header class="page-wrap mt-6">
    <h1 class="text-5xl lg:text-6xl font-display">Privacy Policy</h1>
    <p class="prose-muted mt-1">Last updated: {{ lastUpdated }}</p>
  </header>

  <main class="page-wrap mt-6">
    <section class="card p-6">
      <article class="prose-briko">
        <p>Your privacy matters. This page outlines what data Briko collects and how it’s used.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Analytics:</strong> Privacy-friendly Cloudflare Web Analytics (no cookies, no personal data).</li>
          <li><strong>Authentication:</strong> Email address via Supabase to provide account features.</li>
          <li><strong>Projects:</strong> Images/metadata you upload or create in Briko Studio.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>Operate the app, improve performance, and troubleshoot.</li>
          <li>No sale of personal data. No third-party ads.</li>
        </ul>

        <h2>Storage &amp; sharing</h2>
        <ul>
          <li>Project files are stored in Supabase Storage. Public projects are visible to anyone with the link.</li>
          <li>We may retain logs for security and abuse prevention.</li>
        </ul>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:support@briko.app">support@briko.app</a>.</p>
      </article>
    </section>
  </main>
</template>
