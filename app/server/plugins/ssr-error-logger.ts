export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (err: any, ctx: any) => {
    // err.stack usually shows the exact component/file and line
    // This will surface in CI/prerender logs to pinpoint SSR crashes
    console.error('[SSR ERROR]', ctx?.event?.path, '\n', err?.stack || err)
  })
})
