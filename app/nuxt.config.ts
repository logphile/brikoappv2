import { defineNuxtConfig } from 'nuxt/config'
import rootConfig from '../nuxt.config'

// Reuse root config but run Nuxt with app/ as the project root
export default defineNuxtConfig({
  ...rootConfig,
  // When running inside /app, the source root is the current directory
  srcDir: '.',
})
