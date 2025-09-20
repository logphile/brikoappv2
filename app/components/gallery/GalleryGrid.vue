<template>
  <div class="grid gap-4" :class="gridCols">
    <ProjectCard
      v-for="item in displayItems"
      :key="item.public_id || item.id || item.name"
      :id="item.id"
      :public-id="item.public_id || ''"
      :name="item.name"
      :kind="item.kind"
      :thumb-url="item.thumb_url"
      :original-url="(item as any).orig_url || undefined"
      :username="(item as any).username"
      :bricks="(item as any).bricks"
      :cost="(item as any).cost"
      :likes="item.likes"
      :saves="(item as any).saves"
      :date="(item as any).created_at || (item as any).date"
      :tags="(item as any).tags"
      :is-seed="(item as any).isSeed === true"
      :liked-by-me="!!likedByMeMap[item.id]"
      :saved-by-me="!!savedByMeMap[item.id]"
      @like="$emit('like', item)"
      @unlike="$emit('unlike', item)"
      @save="$emit('save', item)"
      @unsave="$emit('unsave', item)"
      @remix="$emit('remix', item)"
      @share="$emit('share', item)"
      @img-error="onCardImgError"
    />
  </div>
  </template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProjectCard from '@/components/gallery/ProjectCard.vue'

// Accept the full row shape from the gallery view
export type GalleryItem = {
  id: string
  public_id?: string
  name: string
  kind: string
  thumb_url?: string | null
  likes: number
  created_at?: string
  updated_at?: string
  trending?: number
  // Optional rich fields (seeds or enhanced rows)
  username?: string
  bricks?: number
  cost?: number
  saves?: number
  date?: string
  tags?: string[]
  isSeed?: boolean
}

const props = defineProps<{
  items: GalleryItem[]
  likedByMeMap: Record<string, boolean>
  savedByMeMap: Record<string, boolean>
}>()

defineEmits<{
  (e: 'like', item: GalleryItem): void
  (e: 'unlike', item: GalleryItem): void
  (e: 'save', item: GalleryItem): void
  (e: 'unsave', item: GalleryItem): void
  (e: 'remix', item: GalleryItem): void
  (e: 'share', item: GalleryItem): void
}>()

// Track broken images and drop those tiles from the grid entirely
const broken = ref<Set<string>>(new Set())
function onCardImgError(id?: string | number){ if (id != null) broken.value.add(String(id)) }

const displayItems = computed(() => props.items.filter(i => !broken.value.has(String(i.id))))

const gridCols = computed(() => 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5')
</script>
