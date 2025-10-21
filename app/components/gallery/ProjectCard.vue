<template>
  <article v-if="!broken" class="gallery-card group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-black/10 shadow-card transition will-change-transform hover:-translate-y-0.5 hover:shadow-elevated">
    <!-- Preview area: square, original swap on hover/tap -->
    <div class="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-white/10 bg-[#1F2A44]" @mouseenter="preloadOriginal" @touchstart.passive="onTapSwap">
      <!-- Mosaic (default) -->
      <NuxtImg v-if="thumbUrl" :src="thumbUrl" alt=""
           width="320" height="320" format="webp" densities="1x 2x"
           sizes="(max-width: 640px) 100vw, 320px"
           loading="lazy"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
           :class="{ 'opacity-0': showOriginal }"
           @error="onImgError" />
      <div v-else class="absolute inset-0 grid place-items-center text-white/70 text-sm">No preview</div>

      <!-- Original (hover/tap reveal) -->
      <NuxtImg v-if="originalUrl" :src="originalUrl" alt=""
           width="320" height="320" format="webp" densities="1x 2x"
           sizes="(max-width: 640px) 100vw, 320px"
           loading="lazy"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100"
           :class="{ 'opacity-100': showOriginal }"
           @error="onImgError" />

      <!-- Hover overlay actions: neutral/outline buttons (no mint) -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end p-3 bg-black/0 group-hover:bg-black/25 pointer-events-none">
        <div class="actions w-full flex gap-2 pointer-events-auto">
          <NuxtLink
            :to="viewHref"
            class="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-full leading-none text-sm font-medium bg-white text-gray-900/90 ring-1 ring-black/10 shadow-sm hover:bg-white/90 hover:shadow-md transition"
          >
            View
          </NuxtLink>
          <button
            @click.stop.prevent="onRemix"
            :disabled="isRemixing"
            class="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-full leading-none text-sm font-medium text-white bg-[#2F3061] hover:bg-[#2F3061]/90 ring-1 ring-black/0 shadow-sm transition"
          >
            Remix
          </button>
          <button
            v-if="canDelete"
            @click.stop.prevent="askDelete = true"
            class="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-full leading-none text-sm font-medium text-white bg-[#FF0062] shadow-sm hover:bg-[#ff1c73] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Caption under image: include handle (username) next to name, date on the right -->
    <div :class="['mt-2 p-3 rounded-2xl border', props.caption === 'light' ? 'bg-white/5 border-[#34343A]/20 text-[var(--briko-ink-900)]' : 'card-caption-ink']">
      <div class="flex items-center justify-between gap-2">
        <h3 :class="[props.caption === 'light' ? 'text-[#34343A] font-medium' : 'card-title-ink', 'text-[13px] truncate']">
          <span class="truncate">{{ name }}</span>
          <span v-if="username" class="ml-2 opacity-80">
            · @{{ (username || '').replace(/^@/, '') }}
          </span>
        </h3>
        <span :class="[props.caption === 'light' ? 'text-[#34343A]/70' : 'card-date-ink', 'text-[13px] shrink-0']">{{ dateLocal }}</span>
      </div>
    </div>
  </article>
  <ConfirmModal
    v-if="canDelete"
    :open="askDelete"
    title="Delete project?"
    :message="`“${props.name || 'Untitled'}” will be permanently removed.`"
    confirm-label="Delete"
    cancel-label="Cancel"
    danger
    @close="askDelete = false"
    @confirm="doDelete"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { navigateTo } from 'nuxt/app'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useToasts } from '@/composables/useToasts'
// Nuxt auto-imported composables from @nuxtjs/supabase
declare const useSupabaseClient: <T = any>() => T
declare const useSupabaseUser: <T = any>() => T
const isRemixing = ref(false)
const askDelete = ref(false)
const deleting = ref(false)
const supabase = useSupabaseClient<any>()
const user = useSupabaseUser<any>()
const { show: showToast } = useToasts()

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
  canDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'unlike'): void
  (e: 'save'): void
  (e: 'unsave'): void
  (e: 'remix'): void
  (e: 'share'): void
  (e: 'img-error', id: string | number | undefined): void
  (e: 'deleted', id: string | number | undefined): void
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

const imgLoaded = ref(false)
function onImgLoad(){ imgLoaded.value = true }

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

// Remix: param-only navigation (no insert)
async function onRemix(){
  if (isRemixing.value) return
  isRemixing.value = true
  try {
    const id = String(props.id || '')
    if (!id) return
    await navigateTo({ path: '/mosaic', query: { remix: id } })
  } finally {
    isRemixing.value = false
  }
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

const viewHref = computed(() => props.publicId ? `/studio/${props.publicId}` : '/mosaic')
const dateLocal = computed(() => {
  try { return props.date ? new Date(props.date).toLocaleDateString() : '' } catch { return '' }
})

async function doDelete(){
  if (!props.id) return
  if (deleting.value) return
  deleting.value = true
  try {
    const me = user?.value?.id || ''
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', String(props.id))
      .eq('user_id', me)
    if (error) throw error
    emit('deleted', props.id)
    showToast('Project removed.', 'success')
  } catch (e: any) {
    showToast('Could not delete this project.', 'error')
  } finally {
    deleting.value = false
    askDelete.value = false
  }
}
</script>
