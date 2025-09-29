<template>
  <div class="flex items-center gap-4 text-xs text-[#343434]/70">
    <div class="flex items-center gap-2">
      <span class="inline-block h-3 w-3 border border-[#343434]/60 bg-transparent"></span>
      Plate outline
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-block h-3 w-3 border border-[#343434]/60 bg-[#343434]/30"></span>
      Filled cell
    </div>
    <div class="ml-auto grid place-items-center rounded-md border border-[#2F3061]/40 px-2 py-1">
      <span>N</span>
      <div class="flex items-center gap-3">
        <span>W</span>
        <span class="i-lucide-compass h-3 w-3" aria-hidden="true"></span>
        <span>E</span>
      </div>
      <span>S</span>
    </div>
  </div>
</template>
