import { useRuntimeConfig } from '#imports'

export const useSiteMeta = () => {
  const config = useRuntimeConfig()
  const siteName = (config.public as any).siteName || 'BrickMOC'
  const siteUrl = (config.public as any).siteUrl || 'https://brickmoc.app'
  return { siteName, siteUrl }
}
