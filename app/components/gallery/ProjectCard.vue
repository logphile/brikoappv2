<template>
  <article v-if="!broken" class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden group relative transition hover:shadow-mint-glow/20">
    <!-- Preview: mosaic by default, original on hover/tap -->
    <div class="h-[220px] bg-white/5 overflow-hidden relative"
         @mouseenter="preloadOriginal" @touchstart.passive="onTapSwap">
      <!-- Mosaic (default) -->
      <img v-if="thumbUrl" :src="thumbUrl" alt=""
           loading="lazy" decoding="async"
           class="absolute inset-0 w-full h-[220px] object-cover transition-opacity duration-300"
           :class="{ 'opacity-0': showOriginal }"
           @error="onImgError"
      />
      <div v-else class="absolute inset-0 grid place-items-center text-white/70 text-sm">No preview</div>

      <!-- Original (hover/tap reveal) -->
      <img v-if="originalUrl" :src="originalUrl" alt=""
           loading="lazy" decoding="async"
           class="absolute inset-0 w-full h-[220px] object-cover transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100"
           :class="{ 'opacity-100': showOriginal }"
           @error="onImgError"
      />

      <!-- Hover overlay actions (mint unified) -->
      <div class="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-opacity"></div>
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
        <div class="flex gap-2">
          <button class="pointer-events-auto btn-mint text-sm px-3 py-1.5" @click.stop="toProject(publicId)">👁 View</button>
          <button class="pointer-events-auto btn-mint text-sm px-3 py-1.5 ml-1" @click.stop="remixProject">🔄 Remix</button>
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
          <!-- Like (mint unified) -->
          <button :aria-pressed="likedByMe" :title="likedByMe ? 'Unlike' : 'Like'" @click.stop="onLikeClick" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 inline-flex items-center gap-1">
            <span :class="likedByMe ? 'icon-mint' : 'icon-mint-dim'">♥</span>
            <span :class="likedByMe ? 'react-mint' : 'react-mint-dim'">{{ likesLocal }}</span>
          </button>
          <!-- Save / Pin (mint unified) -->
          <button :aria-pressed="savedByMe" :title="savedByMe ? 'Unsave' : 'Save'" @click.stop="onSaveClick" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30 inline-flex items-center gap-1">
            <span :class="savedByMe ? 'icon-mint' : 'icon-mint-dim'">📌</span>
            <span :class="savedByMe ? 'react-mint' : 'react-mint-dim'">{{ savesLocal }}</span>
          </button>
        </div>
        <button title="Share" @click.stop="$emit('share')" class="px-2 py-1 rounded-lg border border-white/15 hover:border-white/30">↗</button>
      </div>

      <div v-if="tags?.length" class="mt-2 flex flex-wrap gap-2">
        <span v-for="t in tags" :key="t" class="chip-mint">#{{ t }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { navigateTo } from 'nuxt/app'

const props = defineProps<{
  id?: string | number
  publicId?: string
  name: string
  kind: string
  thumbUrl?: string | null
  originalUrl?: string | null
  username?: string
  bricks?: number
  cost?: number
  likes: number
  saves?: number
  date?: string
  tags?: string[]
  likedByMe: boolean
  savedByMe?: boolean
  isSeed?: boolean
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'unlike'): void
  (e: 'save'): void
  (e: 'unsave'): void
  (e: 'remix'): void
  (e: 'share'): void
  (e: 'img-error', id: string | number | undefined): void
}>()

const broken = ref(false)

const likesLocal = ref(props.likes)
const savesLocal = ref(props.saves ?? 0)
watch(() => props.likes, v => { likesLocal.value = v })
watch(() => props.saves, v => { savesLocal.value = v ?? 0 })

function onLikeClick(){
  if(props.likedByMe){ emit('unlike'); likesLocal.value = Math.max(0, likesLocal.value - 1) }
  else { emit('like'); likesLocal.value = likesLocal.value + 1 }
}

function onSaveClick(){
  if(props.savedByMe){ emit('unsave'); savesLocal.value = Math.max(0, savesLocal.value - 1) }
  else { emit('save'); savesLocal.value = savesLocal.value + 1 }
}

function onImgError(){
  broken.value = true
  emit('img-error', props.id ?? props.publicId)
}

const showOriginal = ref(false)
function preloadOriginal(){ if(props.originalUrl){ const img = new Image(); img.src = props.originalUrl } }
function onTapSwap(){ if (props.originalUrl) { showOriginal.value = !showOriginal.value } }

const avatarInitial = computed(() => (props.username?.replace('@','')[0] || 'B').toUpperCase())

function slugify(input: string){
  return (input || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,64)
}

function toProject(id?: string){
  if(!id) return
  const slug = slugify(props.name)
  return navigateTo(`/p/${id}${slug ? '-' + slug : ''}`)
}

function remixProject(){
  const id = props.publicId || ''
  const kind = (props.kind || '').toLowerCase()
  const src = props.originalUrl || props.thumbUrl || ''
  if(!src) return
  const query: Record<string, string> = { src, from: id }
  const path = kind === 'voxel' ? '/voxel' : (kind === 'avatar' ? '/avatar' : '/mosaic')
  return navigateTo({ path, query })
}

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
const viewHref = computed(() => props.publicId ? `/p/${props.publicId}-${slugify(props.name)}` : '/mosaic')
</script>
