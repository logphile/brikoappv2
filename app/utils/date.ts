import { useDayjs } from '@/composables/useDayjs'

export function fromNowSafe(d?: string | number | Date) {
  try {
    const dayjs = useDayjs()
    if (!d) return ''
    const inst: any = dayjs(d)
    return typeof inst.fromNow === 'function' ? inst.fromNow() : dayjs(d).format('M/D/YYYY')
  } catch {
    return ''
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
