import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return { status: 'ok', time: new Date().toISOString() }
})
