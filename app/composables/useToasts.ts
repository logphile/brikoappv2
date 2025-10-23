import { useState } from '#imports'

export type ToastType = 'info' | 'success' | 'error'
export interface ToastItem {
  id: number
  message: string
  type: ToastType
  timeout?: number
}

export function useToasts() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const show = (message: string, type: ToastType = 'info', timeout = 2500) => {
    const id = Math.floor(performance.now() + Math.random() * 1000)
    toasts.value.push({ id, message, type, timeout })
    if (timeout && timeout > 0) {
      setTimeout(() => dismiss(id), timeout)
    }
    return id
  }

  return { toasts, show, dismiss }
}
