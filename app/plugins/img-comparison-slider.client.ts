// Registers the <img-comparison-slider> web component on the client.
// Robust to environments where the npm package isn't installed by
// attempting a runtime import and falling back to a CDN ESM build.
// Library: https://github.com/sneas/img-comparison-slider
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return
  try {
    // If already registered, skip
    if (customElements.get('img-comparison-slider')) return
  } catch {
    // ignore
  }

  // Try local dependency first (if present in node_modules).
  // Use a runtime-evaluated specifier to avoid Vite pre-bundling errors when missing.
  const localSpec = 'img-comparison-slider'
  try {
    // @ts-expect-error vite-ignore comment is for the bundler, not TS
    await import(/* @vite-ignore */ localSpec)
    return
  } catch {
    // Fall through to CDN
  }

  try {
    // Load from ESM CDN as a last resort to avoid hard build-time coupling.
    // Pin to a major version if desired, e.g. @9
    // @ts-expect-error vite-ignore comment is for the bundler, not TS
    await import(/* @vite-ignore */ 'https://esm.sh/img-comparison-slider@9')
  } catch (e) {
    console.warn('img-comparison-slider: failed to load (package and CDN). Feature disabled.', e)
  }
})
