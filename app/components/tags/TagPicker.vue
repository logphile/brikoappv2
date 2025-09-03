<template>
  <div class="w-full">
    <div class="flex flex-wrap gap-2 mb-2">
      <span v-for="t in modelValue" :key="t.id ?? t.name" class="px-2 py-1 rounded-full bg-white/10 text-xs inline-flex items-center gap-1">
        <span>#{{ t.name }}</span>
        <button class="opacity-70 hover:opacity-100" @click="$emit('remove', t)">✕</button>
      </span>
    </div>
    <div class="relative">
      <input v-model="q" type="text" :placeholder="placeholder" class="w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-white/30" @keydown.enter.prevent="handleEnter" @input="$emit('search', q)" />
      <div v-if="open && suggestions.length > 0" class="absolute z-10 mt-1 w-full rounded-xl bg-slate-900 ring-1 ring-white/10 shadow-lg overflow-hidden">
        <button v-for="s in suggestions" :key="s.id ?? s.slug ?? s.name" class="w-full text-left px-3 py-2 text-sm hover:bg-white/5" @click.prevent="selectSuggestion(s)">
          #{{ s.name }}
        </button>
      </div>
    </div>
    <p v-if="hint" class="mt-1 text-xs opacity-70">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export type TagItem = { id?: number; name: string; slug?: string }

const props = defineProps<{ modelValue: TagItem[]; suggestions: TagItem[]; placeholder?: string; hint?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: TagItem[]): void; (e: 'create', name: string): void; (e: 'remove', tag: TagItem): void; (e: 'search', q: string): void; (e: 'select', tag: TagItem): void }>()

const q = ref('')
const open = ref(false)

watch(q, (v)=>{ open.value = !!v && props.suggestions.length > 0 })
watch(()=>props.suggestions, (list)=>{ open.value = !!q.value && list.length > 0 })

function handleEnter(){
  const exact = props.suggestions.find(s => s.name.toLowerCase() === q.value.trim().toLowerCase())
  if(exact){ selectSuggestion(exact); return }
  const name = q.value.trim()
  if(!name) return
  emit('create', name)
  q.value = ''
  open.value = false
}

function selectSuggestion(tag: TagItem){
  emit('select', tag)
  q.value = ''
  open.value = false
}
</script>
