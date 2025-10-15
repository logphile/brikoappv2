import { useDayjs } from '@/composables/useDayjs'

export async function ensureRelativeTime() {
  const dayjs = useDayjs()
  const inst: any = dayjs()
  if (typeof inst.fromNow !== 'function') {
    const plugin = (await import('dayjs/plugin/relativeTime')).default
    ;(dayjs as any).extend(plugin)
  }
  return dayjs
}

export async function fromNowSafe(d?: string | number | Date) {
  try {
    if (!d) return ''
    const dayjs = await ensureRelativeTime()
    return (dayjs(d) as any).fromNow()
  } catch {
    const dayjs = useDayjs()
    return d ? dayjs(d).format('M/D/YYYY') : ''
  }
}

export function formatDateSafe(d?: string | number | Date, fmt = 'M/D/YYYY') {
  try {
    const dayjs = useDayjs()
    return d ? dayjs(d).format(fmt) : ''
  } catch {
    return ''
  }
}

// Temporary compatibility alias for any stragglers
export { formatDateSafe as formatDate }
