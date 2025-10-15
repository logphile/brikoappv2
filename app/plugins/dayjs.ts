import dayjs from '@/lib/day'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  return { provide: { dayjs } }
})
