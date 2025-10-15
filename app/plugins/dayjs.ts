import dayjs from '@/lib/day'

export default defineNuxtPlugin(() => {
  return { provide: { dayjs } }
})
