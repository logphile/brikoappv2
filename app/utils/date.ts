import dayjs from '@/lib/day'

export function fromNowSafe(d?: string | number | Date) {
  try {
    return d ? dayjs(d).fromNow() : ''
  } catch {
    return ''
  }
}

export function formatDate(d?: string | number | Date, fmt = 'M/D/YYYY') {
  try {
    return d ? dayjs(d).format(fmt) : ''
  } catch {
    return ''
  }
}
