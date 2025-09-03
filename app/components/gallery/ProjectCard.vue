<template>
  <article class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden group">
    <div class="aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
      <img v-if="thumbUrl" :src="thumbUrl" :alt="name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div v-else class="text-white/70 text-sm">No preview</div>
    </div>
    <div class="p-3 flex items-center justify-between gap-2">
      <div class="min-w-0">
        <div class="truncate font-medium">{{ name }}</div>
        <div class="text-xs opacity-70 capitalize">{{ kind }}</div>
      </div>
      <div class="flex items-center gap-1">
        <button :aria-pressed="likedByMe" :title="likedByMe ? 'Unlike' : 'Like'" @click.stop="onLikeClick" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 text-xs inline-flex items-center gap-1">
          <span>👍</span>
          <span>{{ likesLocal }}</span>
        </button>
        <button title="Remix" @click.stop="$emit('remix')" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 text-xs">⟲</button>
        <button title="Share" @click.stop="$emit('share')" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 text-xs">↗</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  publicId: string
  name: string
  kind: string
  thumbUrl?: string | null
  likes: number
  likedByMe: boolean
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'unlike'): void
  (e: 'remix'): void
  (e: 'share'): void
}>()

const likesLocal = ref(props.likes)
watch(() => props.likes, v => { likesLocal.value = v })

function onLikeClick(){
  if(props.likedByMe){ emit('unlike'); likesLocal.value = Math.max(0, likesLocal.value - 1) }
  else { emit('like'); likesLocal.value = likesLocal.value + 1 }
}
</script>
