import { useNuxtApp, useRuntimeConfig } from 'nuxt/app'

export type ProjectKind = 'mosaic' | 'voxel' | 'avatar'
export type ReactionType = 'like' | 'save'

export const useProjects = () => {
  const { $supabase } = useNuxtApp() as any
  const { public: pub } = useRuntimeConfig()

  function buildPreviewUrl(previewPath: string) {
    // public object URL pattern: {supabaseUrl}/storage/v1/object/public/{path}
    const base = (pub as any)?.supabaseUrl || ''
    if (!previewPath) return ''
    return `${base}/storage/v1/object/public/${previewPath.replace(/^\/+/, '')}`
  }

  // Downscale a raw File/Blob to a <= maxEdge WebP blob
  async function fileToScaledWebP(file: File | Blob, maxEdge = 800, quality = 0.92): Promise<Blob> {
    const bmp = await createImageBitmap(file as any)
    const w = bmp.width, h = bmp.height
    const long = Math.max(w, h)
    const scale = long > maxEdge ? (maxEdge / long) : 1
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    if (typeof OffscreenCanvas !== 'undefined') {
      const src = new OffscreenCanvas(w, h)
      const sctx = src.getContext('2d')!
      sctx.drawImage(bmp, 0, 0)
      const dst = new OffscreenCanvas(outW, outH)
      const dctx = dst.getContext('2d')!
      dctx.imageSmoothingEnabled = true
      dctx.drawImage(src, 0, 0, w, h, 0, 0, outW, outH)
      return await (dst as any).convertToBlob({ type: 'image/webp', quality })
    } else {
      const src = document.createElement('canvas')
      src.width = w; src.height = h
      const sctx = src.getContext('2d')!
      sctx.drawImage((bmp as any), 0, 0)
      const dst = document.createElement('canvas')
      dst.width = outW; dst.height = outH
      const dctx = dst.getContext('2d')!
      dctx.imageSmoothingEnabled = true
      dctx.drawImage(src, 0, 0, w, h, 0, 0, outW, outH)
      return await new Promise<Blob>((resolve, reject) => (dst as HTMLCanvasElement).toBlob(b => b ? resolve(b) : reject(new Error('toBlob null')),'image/webp', quality))
    }
  }

  async function canvasToWebpBlob(canvas: HTMLCanvasElement | OffscreenCanvas, quality = 0.92): Promise<Blob> {
    // Prefer convertToBlob with webp
    if ('convertToBlob' in canvas && typeof (canvas as any).convertToBlob === 'function') {
      return await (canvas as any).convertToBlob({ type: 'image/webp', quality })
    }
    return await new Promise<Blob>((resolve, reject) => {
      try {
        (canvas as HTMLCanvasElement).toBlob((b) => {
          if (b) resolve(b); else reject(new Error('toBlob returned null'))
        }, 'image/webp', quality)
      } catch (e) { reject(e as any) }
    })
  }

  async function canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob> {
    if ('convertToBlob' in canvas && typeof (canvas as any).convertToBlob === 'function') {
      return await (canvas as any).convertToBlob({ type: 'image/png' })
    }
    return await new Promise<Blob>((resolve, reject) => {
      try {
        (canvas as HTMLCanvasElement).toBlob((b) => {
          if (b) resolve(b); else reject(new Error('toBlob returned null'))
        }, 'image/png')
      } catch (e) { reject(e as any) }
    })
  }

  async function uploadPreviewPNG(userId: string, projectId: string, canvas: HTMLCanvasElement | OffscreenCanvas) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const blob = await canvasToBlob(canvas)
    const path = `projects/${userId}/${projectId}/preview.png`
    const { error } = await $supabase.storage.from('projects').upload(path, blob, { upsert: true, contentType: 'image/png' })
    if (error) throw error
    return path as string
  }

  async function insertUserProject(input: {
    user_id: string
    id?: string
    title: string
    kind: ProjectKind
    preview_path: string
    bricks?: number
    cost_est?: number
    tags?: string[]
    status?: 'private' | 'public'
  }) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const payload = { ...input, status: input.status || 'private' }
    const { data, error } = await $supabase.from('user_projects').insert(payload).select().single()
    if (error) throw error
    return data
  }

  async function makePublic(projectId: string, userId: string) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { error } = await $supabase.from('user_projects').update({ status: 'public' }).eq('id', projectId).eq('user_id', userId)
    if (error) throw error
    return true
  }

  async function queryPublicProjects(sort: 'Trending'|'New'|'Top', limit = 60) {
    if (!$supabase) throw new Error('Supabase unavailable')
    let orderKey = 'created_at'
    if (sort === 'Trending') orderKey = 'trend_score'
    if (sort === 'Top') orderKey = 'popularity'
    // If columns missing, Supabase will error; we will fall back to client sort on caller side
    const { data, error } = await $supabase
      .from('user_projects_public')
      .select('id, title, kind, preview_path, created_at, updated_at, likes, saves, bricks, cost_est, tags, handle, display_name, original_preview_path, original_path, trend_score, popularity, status, is_public')
      .order(orderKey as any, { ascending: false })
      .limit(limit)
    if (error) {
      // fallback to un-ordered fetch
      const { data: d2 } = await $supabase
        .from('user_projects_public')
        .select('id, title, kind, preview_path, created_at, updated_at, likes, saves, bricks, cost_est, tags, handle, display_name, original_preview_path, original_path, trend_score, popularity, status, is_public')
        .limit(limit)
      return d2 || []
    }
    return data || []
  }

  async function getReactionsByMe(projectIds: string[], userId: string) {
    if (!$supabase || !projectIds.length) return { likes: {}, saves: {} } as { likes: Record<string, boolean>, saves: Record<string, boolean> }
    const { data, error } = await $supabase.from('reactions').select('project_id, rtype').in('project_id', projectIds).eq('user_id', userId)
    if (error) return { likes: {}, saves: {} }
    const likes: Record<string, boolean> = {}
    const saves: Record<string, boolean> = {}
    for (const r of (data || [])) {
      const pid = (r as any).project_id as string
      const t = (r as any).rtype as string
      if (t === 'like') likes[pid] = true
      if (t === 'save') saves[pid] = true
    }
    return { likes, saves }
  }

  async function upsertReaction(projectId: string, userId: string, rtype: ReactionType) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { error } = await $supabase.from('reactions').upsert({ project_id: projectId, user_id: userId, rtype })
    if (error) throw error
  }

  async function deleteReaction(projectId: string, userId: string, rtype: ReactionType) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { error } = await $supabase.from('reactions').delete().eq('project_id', projectId).eq('user_id', userId).eq('rtype', rtype)
    if (error) throw error
  }

  // --- Publishing helpers ---------------------------------------------------
  function slugify(title: string) {
    return String(title || 'untitled')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 80)
  }

  async function ensureUniqueSlug(title: string) {
    if (!$supabase) return slugify(title)
    const base = slugify(title || 'untitled')
    let slug = base, n = 2
    // If slug column doesn't exist, this select will error — we fail open
    while (true) {
      try {
        const { count, error } = await $supabase
          .from('user_projects')
          .select('id', { count: 'exact', head: true })
          .eq('slug', slug)
        if (error) break
        if ((count ?? 0) === 0) break
        slug = `${base}-${n++}`
      } catch {
        break
      }
    }
    return slug
  }

  async function ensurePublicCover(projectId: string, _userId?: string) {
    if (!$supabase) throw new Error('Supabase unavailable')
    // Fetch preview_path for this project
    const { data, error } = await $supabase
      .from('user_projects')
      .select('preview_path')
      .eq('id', projectId)
      .single()
    if (error) { console.warn('[ensurePublicCover] fetch failed', error); return null }
    const previewPath = (data as any)?.preview_path as string | undefined
    if (!previewPath) return null
    const publicUrl = buildPreviewUrl(previewPath)
    // Best-effort: set cover_url if the column exists
    try { await $supabase.from('user_projects').update({ cover_url: publicUrl }).eq('id', projectId) } catch {}
    return publicUrl
  }

  async function publishProject(projectId: string, opts?: { title?: string }) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')
    if (!projectId) throw new Error('Missing projectId')

    // Compute a unique slug if possible
    let slug: string | null = null
    if (opts?.title) {
      try { slug = await ensureUniqueSlug(opts.title) } catch { slug = null }
    }

    // 1) Minimal update: set status public (should exist in new schema)
    {
      const { error } = await $supabase
        .from('user_projects')
        .update({ status: 'public' })
        .eq('id', projectId)
        .eq('user_id', user.id)
      if (error) throw error
    }
    // 2) Optional: set slug if column exists (propagate unique constraint errors)
    if (slug) {
      const { error } = await $supabase
        .from('user_projects')
        .update({ slug })
        .eq('id', projectId)
        .eq('user_id', user.id)
      if (error) {
        // If column missing, ignore; otherwise propagate so UI can show real message
        const msg = String((error as any)?.message || '')
        if (!/column .*slug.* does not exist/i.test(msg)) throw error
      }
    }
    // 3) Optional: set published_at if column exists; swallow missing-column errors
    {
      const ts = new Date().toISOString()
      const { error } = await $supabase
        .from('user_projects')
        .update({ published_at: ts })
        .eq('id', projectId)
        .eq('user_id', user.id)
      if (error) {
        const msg = String((error as any)?.message || '')
        if (!/column .*published_at.* does not exist/i.test(msg)) throw error
      }
    }

    // Ensure cover is publicly resolvable
    const coverUrl = await ensurePublicCover(projectId, user.id)
    if (!coverUrl) throw new Error('cover image not public')

    return { id: projectId, slug: slug || undefined, coverUrl }
  }

  // Create a project with a fingerprinted WebP preview path and upload the preview blob first.
  async function createProject(input: {
    title: string
    kind: ProjectKind
    width: number
    height: number
    palette_id: string
    previewBlob?: Blob
    sourceFile?: File | Blob
    mode?: 'auto'|'line-art'|'photo'
    bricks_est?: number
    cost_est_usd?: number
    makePublic?: boolean
  }) {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const id: string = (globalThis.crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2)
    const mode = input.mode || 'auto'
    const fname = `preview-w${input.width}-h${input.height}-pal${input.palette_id}-mode${mode}-v1.webp`
    const storagePath = `projects/${user.id}/${id}/${fname}`

    // Build preview blob (fallback to canvas if not provided)
    let blob = input.previewBlob || null
    if (!blob) {
      const cvs: HTMLCanvasElement | OffscreenCanvas | undefined = (window as any).__brikoCanvas
      if (!cvs) throw new Error('No preview available to upload')
      blob = await canvasToWebpBlob(cvs)
    }

    // Upload preview first to satisfy NOT NULL preview_path schemas
    {
      const { error } = await $supabase.storage.from('projects').upload(storagePath, blob!, { upsert: true, contentType: 'image/webp', cacheControl: 'public, max-age=86400' })
      if (error) throw error
    }

    // Build and upload a small original preview if source file provided
    let origPath: string | null = null
    if (input.sourceFile) {
      try {
        const origBlob = await fileToScaledWebP(input.sourceFile, 800)
        const origName = `original-preview-800w-v1.webp`
        origPath = `projects/${user.id}/${id}/${origName}`
        const { error: origErr } = await $supabase.storage.from('projects').upload(origPath, origBlob, { upsert: true, contentType: 'image/webp', cacheControl: 'public, max-age=86400' })
        if (origErr) { console.warn('[createProject] original preview upload failed', origErr) }
      } catch (e) {
        console.warn('[createProject] original preview generation failed', e)
      }
    }

    // Insert row (new schema)
    const payload1: any = {
      id,
      user_id: user.id,
      title: input.title,
      kind: input.kind,
      status: 'private',
      preview_path: storagePath,
      original_preview_path: origPath || null,
      bricks: input.bricks_est,
      cost_est: input.cost_est_usd,
      tags: []
    }
    let rec: any
    let { data, error } = await $supabase.from('user_projects').insert(payload1).select().single()
    if (error) {
      // Fallback: older schema with is_public/published_at
      const payload2: any = {
        id,
        user_id: user.id,
        title: input.title,
        kind: input.kind,
        is_public: false,
        published_at: new Date().toISOString(),
        preview_path: storagePath
      }
      const res2 = await $supabase.from('user_projects').insert(payload2).select().single()
      if (res2.error) throw res2.error
      rec = res2.data
      // Best-effort: set original_preview_path if the column exists
      if (origPath) {
        try { await $supabase.from('user_projects').update({ original_preview_path: origPath }).eq('id', id).eq('user_id', user.id) } catch {}
      }
    } else {
      rec = data
    }

    if (input.makePublic) {
      await makePublic(rec.id, user.id)
    }
    return rec
  }

  return {
    buildPreviewUrl,
    fileToScaledWebP,
    canvasToBlob,
    canvasToWebpBlob,
    uploadPreviewPNG,
    insertUserProject,
    createProject,
    makePublic,
    publishProject,
    queryPublicProjects,
    getReactionsByMe,
    upsertReaction,
    deleteReaction,
    ensureUniqueSlug,
    ensurePublicCover,
  }
}
