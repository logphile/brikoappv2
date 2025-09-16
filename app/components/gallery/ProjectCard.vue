<template>
  <article class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden group relative transition hover:shadow-mint-glow/20">
    <!-- Preview -->
    <div class="aspect-square bg-black/20 overflow-hidden relative">
      <img v-if="thumbUrl" :src="thumbUrl" :alt="name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div v-else class="absolute inset-0 grid place-items-center text-white/70 text-sm">No preview</div>
      <!-- Hover overlay actions -->
      <div class="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/35 transition"></div>
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition grid place-items-center">
        <div class="flex gap-2">
          <NuxtLink :to="viewHref" class="pointer-events-auto btn-outline-mint text-sm px-3 py-1.5">👁 View</NuxtLink>
          <button class="pointer-events-auto btn-mint text-sm px-3 py-1.5" @click.stop="$emit('remix')">🔄 Remix</button>
        </div>
      </div>
    </div>

    <!-- Meta -->
    <div class="p-3">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">
          {{ avatarInitial }}
        </div>
        <div class="min-w-0">
          <div class="truncate font-semibold">{{ username || '@anonymous' }}</div>
          <div class="truncate text-sm text-white/80">{{ name }}</div>
        </div>
      </div>

      <div class="mt-2 flex items-center justify-between text-xs text-white/75">
        <div class="flex items-center gap-2">
          <span>{{ bricks?.toLocaleString() }} bricks</span>
          <span class="opacity-60">·</span>
          <span>${{ cost?.toLocaleString() }} est.</span>
        </div>
        <div>{{ relative }}</div>
      </div>

      <div class="mt-2 flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <button :aria-pressed="likedByMe" :title="likedByMe ? 'Unlike' : 'Like'" @click.stop="onLikeClick" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 inline-flex items-center gap-1">
            <span>❤️</span>
            <span>{{ likesLocal }}</span>
          </button>
          <div class="px-2 py-1 rounded-lg border border-white/15 text-white/80 inline-flex items-center gap-1">
            <span>📌</span>
            <span>{{ saves ?? 0 }}</span>
          </div>
        </div>
        <button title="Share" @click.stop="$emit('share')" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30">↗</button>
      </div>

      <div v-if="tags?.length" class="mt-2 flex flex-wrap gap-1">
        <span v-for="t in tags" :key="t" class="text-[11px] px-2 py-0.5 rounded-full bg-white/7 ring-1 ring-white/10 text-white/80">#{{ t }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  publicId?: string
  name: string
  kind: string
  thumbUrl?: string | null
  username?: string
  bricks?: number
  cost?: number
  likes: number
  saves?: number
  date?: string
  tags?: string[]
  likedByMe: boolean
  isSeed?: boolean
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

const avatarInitial = computed(() => (props.username?.replace('@','')[0] || 'B').toUpperCase())

function relativeTime(input?: string){
  if(!input) return ''
  const d = new Date(input)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  const r = (n:number,u:string)=>`${n} ${u}${n!==1?'s':''} ago`
  if(s < 60) return r(s,'second')
  const m = Math.floor(s/60); if(m<60) return r(m,'minute')
  const h = Math.floor(m/60); if(h<24) return r(h,'hour')
  const dys = Math.floor(h/24); if(dys<30) return r(dys,'day')
  const mo = Math.floor(dys/30); if(mo<12) return r(mo,'month')
  const y = Math.floor(mo/12); return r(y,'year')
}

const relative = computed(() => relativeTime(props.date))
const viewHref = computed(() => props.publicId ? `/project/${props.publicId}` : '/mosaic')
</script>
