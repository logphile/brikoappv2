<template>
  <div class="grid gap-4" :class="gridCols">
    <ProjectCard
      v-for="item in items"
      :key="item.public_id"
      :public-id="item.public_id"
      :name="item.name"
      :kind="item.kind"
      :thumb-url="item.thumb_url"
      :likes="item.likes"
      :liked-by-me="!!likedByMeMap[item.id]"
      @like="$emit('like', item)"
      @unlike="$emit('unlike', item)"
      @remix="$emit('remix', item)"
      @share="$emit('share', item)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProjectCard from '@/components/gallery/ProjectCard.vue'

// Accept the full row shape from the gallery view
export type GalleryItem = {
  id: string
  public_id: string
  name: string
  kind: string
  thumb_url?: string | null
  likes: number
  created_at: string
  updated_at: string
  trending?: number
}

const props = defineProps<{
  items: GalleryItem[]
  likedByMeMap: Record<string, boolean>
}>()

defineEmits<{
  (e: 'like', item: GalleryItem): void
  (e: 'unlike', item: GalleryItem): void
  (e: 'remix', item: GalleryItem): void
  (e: 'share', item: GalleryItem): void
}>()

const gridCols = computed(() => 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4')
</script>
