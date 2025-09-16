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
      .select('*')
      .order(orderKey as any, { ascending: false })
      .limit(limit)
    if (error) {
      // fallback to un-ordered fetch
      const { data: d2 } = await $supabase.from('user_projects_public').select('*').limit(limit)
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

  return {
    buildPreviewUrl,
    canvasToBlob,
    uploadPreviewPNG,
    insertUserProject,
    makePublic,
    queryPublicProjects,
    getReactionsByMe,
    upsertReaction,
    deleteReaction,
  }
}
