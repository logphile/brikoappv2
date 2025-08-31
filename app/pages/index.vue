<template>
  <Head>
    <Title>Briko — BrickMOC Companion</Title>
    <Meta name="description" content="Turn any idea or image into a LEGO-style build preview with parts & price. Not affiliated with the LEGO Group." />
    <Meta property="og:title" content="Briko — BrickMOC Companion" />
    <Meta property="og:description" content="Turn any idea or image into a LEGO-style build preview with parts & price." />
    <Meta property="og:type" content="website" />
  </Head>
  <main class="min-h-screen bg-midnight text-white">
    <!-- top bar -->
    <header class="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div aria-hidden="true" class="h-8 w-8 rounded-xl bg-cta-grad ring-1 ring-white/10"></div>
        <span class="text-xl font-semibold tracking-tight">Briko</span>
      </div>
      <nav class="hidden sm:flex items-center gap-6 text-sm text-white/80">
        <a href="#how" class="hover:text-white">How it works</a>
        <a href="#updates" class="hover:text-white">Updates</a>
        <a href="mailto:hello@briko.app" class="hover:text-white">Contact</a>
      </nav>
    </header>

    <!-- hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-10 opacity-30 blur-2xl"
           :style="{ background: 'radial-gradient(60% 50% at 20% 10%, #FF5A1F33 0%, transparent 60%), radial-gradient(50% 40% at 90% 20%, #2563EB33 0%, transparent 60%), radial-gradient(40% 50% at 70% 80%, #2DD4BF33 0%, transparent 60%)' }"/>
      <div class="mx-auto max-w-6xl px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="text-5xl sm:text-6xl font-extrabold leading-tight">
            Turn any idea or image<br class="hidden sm:block" />
            into a <span class="bg-cta-grad bg-clip-text text-transparent">brick build</span>.
          </h1>
          <p class="mt-5 text-lg text-white/80">
            Upload a photo or prompt → see a LEGO-style mosaic/voxel preview with a parts list & price — ready to export.
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <a href="mailto:hello@briko.app"
               class="px-5 py-3 rounded-2xl font-medium text-midnight bg-cta-grad shadow hover:opacity-95">
               Get launch updates
            </a>
            <a href="#how"
               class="px-5 py-3 rounded-2xl font-medium border border-white/20 hover:border-white/40">
               See the plan
            </a>
          </div>

          <p class="mt-6 text-xs text-white/60">
            Not affiliated with the LEGO Group.
          </p>
        </div>

        <!-- visual card -->
        <div>
          <div class="mb-3 text-sm uppercase tracking-widest text-white/60">Instant preview — drag to compare</div>
          <HeroDemo originalSrc="/demo/original.jpg" mosaicSrc="/demo/mosaic.jpg" />
        </div>
      </div>
    </section>

    <!-- how it works -->
    <section id="how" class="mx-auto max-w-6xl px-6 pb-24">
      <ol class="grid gap-6 sm:grid-cols-3">
        <li class="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
          <div class="text-sm text-pacific font-semibold">1. Upload or prompt</div>
          <p class="mt-1 text-white/80 text-sm">We preprocess with OpenCV.js and map to a brick palette.</p>
        </li>
        <li class="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
          <div class="text-sm text-pacific font-semibold">2. Preview fast</div>
          <p class="mt-1 text-white/80 text-sm">Mosaic or 3D voxel (Three.js InstancedMesh). Workers keep UI instant.</p>
        </li>
        <li class="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
          <div class="text-sm text-pacific font-semibold">3. Parts & price</div>
          <p class="mt-1 text-white/80 text-sm">Greedy tiler → BOM & cost. Export CSV/PNG/PDF. Share your MOC.</p>
        </li>
      </ol>
    </section>

    <!-- updates -->
    <section id="updates" class="bg-black/20">
      <div class="mx-auto max-w-6xl px-6 py-12">
        <div class="rounded-2xl p-6 bg-white/5 ring-1 ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-lg font-semibold">Want early access?</div>
            <p class="text-white/80 text-sm">Ping us and we’ll add you to the first wave.</p>
          </div>
          <a href="mailto:hello@briko.app" class="px-5 py-3 rounded-2xl font-medium text-midnight bg-cta-grad shadow hover:opacity-95">
            Email hello@briko.app
          </a>
        </div>
      </div>
    </section>

    <footer class="mx-auto max-w-6xl px-6 py-10 text-white/60 text-xs">
      © {{ new Date().getFullYear() }} Briko — BrickMOC Companion
    </footer>
  </main>
</template>
