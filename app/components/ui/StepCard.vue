<script setup lang="ts">
defineProps<{ step?: number; title: string }>()
</script>

<template>
  <section class="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
    <!-- header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-black/10">
      <div v-if="step!=null" class="h-8 w-8 shrink-0 rounded-full bg-[#FFD808] text-[#2F3061] font-semibold grid place-items-center">
        {{ step }}
      </div>
      <h3 class="font-semibold text-[#343434]">{{ title }}</h3>
      <div class="ml-auto"><slot name="actions" /></div>
    </div>
    <!-- body -->
    <div class="p-4 sm:p-6">
      <slot />
    </div>
  </section>
</template>
