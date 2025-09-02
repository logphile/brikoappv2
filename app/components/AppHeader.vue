<template>
  <header class="w-full border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
    <nav class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between text-white">
      <NuxtLink to="/" class="font-bold text-xl">Briko</NuxtLink>
      <div class="flex items-center gap-4">
        <NuxtLink to="/mosaic" class="hover:underline">Mosaic</NuxtLink>
        <NuxtLink to="/avatar" class="hover:underline">Avatar</NuxtLink>
        <NuxtLink to="/projects" class="hover:underline">Projects</NuxtLink>
        <NuxtLink to="/login" class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Login</NuxtLink>
      </div>
    </nav>
  </header>
</template>
