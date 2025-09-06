import { defineNuxtPlugin } from '#app'
import VueCompareImage from 'vue-compare-image'

export default defineNuxtPlugin((nuxtApp) => {
  // Register globally so templates can use <VueCompareImage />
  nuxtApp.vueApp.component('VueCompareImage', (VueCompareImage as unknown) as any)
})
