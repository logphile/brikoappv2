export function breadcrumbJsonLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`
    }))
  }
}

export function webPageJsonLd(siteUrl: string, path: string, name: string, description: string) {
  const url = `${siteUrl}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    description,
    image: `${siteUrl}/og-default.png`,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${siteUrl}/og-default.png`
    }
  }
}
