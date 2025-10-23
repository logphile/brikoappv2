import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { defineNuxtPlugin } from '#imports'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export default defineNuxtPlugin(() => ({ provide: { dayjs } }))
