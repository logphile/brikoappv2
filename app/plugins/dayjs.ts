import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend the single global instance once
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export default defineNuxtPlugin(() => {
  return { provide: { dayjs } }
})
