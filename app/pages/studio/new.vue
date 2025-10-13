<template>
  <div>
    <!-- Header with actions -->
    <header class="page-wrap mt-4 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-5xl lg:text-6xl font-slab">New Project</h1>
        <p class="mt-2 text-[#34343A]/70">Start a project from a photo. You can tweak everything later.</p>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <button class="btn-outline-ink" @click="onCancel">Cancel</button>
        <button class="btn-primary" @click="onSave">Create</button>
      </div>
    </header>

    <!-- mobile FAB -->
    <div class="md:hidden fixed bottom-4 right-4 left-4 flex justify-end gap-2">
      <button class="btn-outline-ink" @click="onCancel">Cancel</button>
      <button class="btn-primary" @click="onSave">Create</button>
    </div>

    <!-- Content -->
    <main class="page-wrap mt-8 space-y-10">
      <!-- 1) Source image -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Source</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Dropzone -->
          <div class="md:col-span-2">
            <label class="label-briko text-white">Upload a photo</label>
            <div
              class="mt-2 rounded-xl bg-white/90 border border-white/10 p-6 text-center shadow-sm"
              :class="{ 'ring-2 ring-[#FF0062]/30': !!form.file }"
            >
              <input
                id="file"
                type="file"
                accept="image/*"
                class="sr-only"
                @change="form.file = ($event?.target as HTMLInputElement)?.files?.[0] ?? null"
              />
              <label for="file" class="btn-outline-ink cursor-pointer">Browse</label>
              <p class="help-briko help-briko--ink mt-2">PNG, JPG, or WebP · up to 25 MB</p>
              <p v-if="form.file" class="mt-2 pill-micro inline-block bg-white/80 text-[#34343A]">
                {{ form.file?.name }}
              </p>
            </div>
          </div>

          <!-- Quick preview -->
          <div>
            <label class="label-briko text-white">Preview</label>
            <div class="mt-2 aspect-square rounded-xl bg-black/20 flex items-center justify-center text-white/70">
              <span v-if="!form.file">No image</span>
              <img v-else :src="URL.createObjectURL(form.file)" loading="lazy" class="h-full w-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <!-- 2) Details -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Details</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="label-briko text-white" for="title">Title</label>
            <input id="title" v-model="form.title" class="input-briko input-briko--ink mt-1" placeholder="Give it a name" />
            <p class="help-briko help-briko--ink">You can rename later.</p>
          </div>

          <div>
            <label class="label-briko text-white" for="visibility">Visibility</label>
            <select id="visibility" v-model="form.visibility" class="select-briko select-briko--ink mt-1">
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <p class="help-briko help-briko--ink">Public projects can appear in the Community Gallery.</p>
          </div>
        </div>
      </section>

      <!-- 3) Size & palette -->
      <section class="card-ink p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="section-h--ink">Size & Palette</span>
          <div class="section-rule--ink"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label class="label-briko text-white">Width (studs)</label>
            <input type="range" min="16" max="128" step="2" v-model.number="form.width" class="slider-briko mt-3" />
            <p class="help-briko help-briko--ink">{{ form.width }} studs</p>
          </div>
          <div>
            <label class="label-briko text-white">Height (studs)</label>
            <input type="range" min="16" max="128" step="2" v-model.number="form.height" class="slider-briko mt-3" />
            <p class="help-briko help-briko--ink">{{ form.height }} studs</p>
          </div>
          <div>
            <label class="label-briko text-white">Units</label>
            <select v-model="form.units" class="select-briko select-briko--ink mt-1">
              <option value="studs">Studs</option>
              <option value="cm">Centimeters</option>
              <option value="in">Inches</option>
            </select>

            <label class="label-briko text-white mt-4 block">Palette</label>
            <select v-model="form.palette" class="select-briko select-briko--ink mt-1">
              <option value="lego">LEGO (default)</option>
              <option value="duplo">Duplo</option>
              <option value="bw">Black & White</option>
            </select>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { navigateTo } from 'nuxt/app'

const form = reactive<{ title: string; visibility: 'private'|'public'; width: number; height: number; units: 'studs'|'cm'|'in'; palette: 'lego'|'duplo'|'bw'; file: File | null }>({
  title: '',
  visibility: 'private',
  width: 32,
  height: 32,
  units: 'studs',
  palette: 'lego',
  file: null
})

function onSave(){
  // TODO: create project (upload file, save metadata)
}
function onCancel(){ navigateTo('/studio') }
</script>
