import { toRaw } from 'vue'

export function toPlain<T>(v: T): T {
  // Strip Vue proxies/functions; produce JSON-safe plain object
  return JSON.parse(JSON.stringify(toRaw(v)))
}
