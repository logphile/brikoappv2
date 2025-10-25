// Registers the <img-comparison-slider> web component on the client.
// Robust to environments where the npm package isn't installed by
// attempting a runtime import and falling back to a CDN ESM build.
// Library: https://github.com/sneas/img-comparison-slider
import { defineNuxtPlugin } from 'nuxt/app'

// Disabled: we now use a local CompareSlider component instead of the web component.
export default defineNuxtPlugin(() => {
  return
})
