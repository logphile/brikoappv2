<template>
  <article v-if="!broken" class="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/10 transition hover:bg-white/7">
    <!-- Preview area: square, original swap on hover/tap -->
    <div class="relative rounded-xl overflow-hidden aspect-square bg-[#1F2A44]" @mouseenter="preloadOriginal" @touchstart.passive="onTapSwap">
      <!-- Mosaic (default) -->
      <img v-if="thumbUrl" :src="thumbUrl" alt=""
           loading="lazy" decoding="async"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
           :class="{ 'opacity-0': showOriginal }"
           @error="onImgError" />
      <div v-else class="absolute inset-0 grid place-items-center text-white/70 text-sm">No preview</div>

      <!-- Original (hover/tap reveal) -->
      <img v-if="originalUrl" :src="originalUrl" alt=""
           loading="lazy" decoding="async"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100"
           :class="{ 'opacity-100': showOriginal }"
           @error="onImgError" />

      <!-- Hover overlay actions: neutral/outline buttons (no mint) -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end p-3 bg-black/0 group-hover:bg-black/25">
        <div class="w-full flex gap-2">
          <button class="btn flex-1 ring-1 ring-black/10 bg-white/10 hover:bg-white/20 text-[var(--briko-ink-900)] transition" @click.stop="remixProject">Remix</button>
          <NuxtLink :to="viewHref" class="btn flex-1 ring-1 ring-black/10 bg-white/50 hover:bg-white/70 text-[var(--briko-ink-900)] transition">View</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Caption under image: keep ink card variant or light variant -->
    <div :class="['mt-2 p-3 rounded-2xl border', props.caption === 'light' ? 'bg-white/5 border-[#34343A]/20 text-[var(--briko-ink-900)]' : 'card-caption-ink']">
      <h3 :class="[props.caption === 'light' ? 'text-[#34343A] font-medium' : 'card-title-ink', 'text-base line-clamp-1']">
        {{ name }}
      </h3>
      <div class="mt-1">
        <span :class="[props.caption === 'light' ? 'text-[#34343A]/70 text-[11px]' : 'card-date-ink']">{{ dateLocal }}</span>
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
  caption?: 'ink' | 'light'
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

// local reaction state is not displayed in the simplified card, but keep emit-compatible handlers
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

const viewHref = computed(() => props.publicId ? `/p/${props.publicId}-${slugify(props.name)}` : '/mosaic')
const dateLocal = computed(() => {
  try { return props.date ? new Date(props.date).toLocaleDateString() : '' } catch { return '' }
})
</script>
