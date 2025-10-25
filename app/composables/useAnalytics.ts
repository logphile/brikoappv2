export function trackEvent(event: string, props: Record<string, any> = {}) {
  try {
    const path = typeof window !== 'undefined' ? window.location.pathname : undefined
    const ref = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('ref') || undefined) : undefined
    const payload: any = { event, path, ref, props }
    if (props && typeof props === 'object' && 'projectId' in props && props.projectId) {
      payload.project_id = props.projectId
    }
    return fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  } catch {
    return Promise.resolve()
  }
}
