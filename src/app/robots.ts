import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dtk-corporation.example'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth', '/dashboard', '/api'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
