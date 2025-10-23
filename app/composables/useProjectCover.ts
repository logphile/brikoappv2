import { useNuxtApp } from '#imports'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseClient: <T = any>() => T

export async function saveProjectCover(opts: {
  projectId: string
  el: HTMLElement
}): Promise<string> {
  const { projectId, el } = opts

  // Capture to PNG Blob: prefer canvas, fallback to html2canvas
  let blob: Blob
  if (el instanceof HTMLCanvasElement) {
    const dataUrl = el.toDataURL('image/png')
    blob = await (await fetch(dataUrl)).blob()
  } else {
    const { default: html2canvas } = await import('html2canvas')
    const cnv = await html2canvas(el, { backgroundColor: null, scale: 2 })
    blob = await new Promise<Blob>((res, rej) => cnv.toBlob((b) => (b ? res(b) : rej(new Error('PNG encode failed'))), 'image/png'))
  }

  // Resolve Supabase client (module or injected)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any = null
  try { supabase = useSupabaseClient<any>() } catch {}
  if (!supabase) supabase = (useNuxtApp() as any)?.$supabase
  if (!supabase) throw new Error('Supabase client unavailable')

  // Object key inside the 'covers' bucket (no bucket prefix)
  const key = `projects/${projectId}.png`

  // Upload with upsert
  const { error: upErr } = await supabase.storage.from('covers').upload(key, blob, {
    contentType: 'image/png',
    upsert: true
  })
  if (upErr) throw upErr

  // Public URL (no expiry)
  const { data } = supabase.storage.from('covers').getPublicUrl(key)
  const url = (data as any)?.publicUrl || (data as any)?.publicURL || (data as any)?.public_url
  if (!url) throw new Error('Could not resolve public URL for cover')

  // Write back to projects.cover_url (tolerate legacy schemas)
  try {
    await supabase.from('projects').update({ cover_url: url }).eq('id', projectId)
  } catch {
    // ignore
  }

  return url as string
}
