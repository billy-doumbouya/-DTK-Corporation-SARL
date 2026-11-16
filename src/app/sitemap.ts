import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dtk-corporation.example'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/sous-traitance`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/produits`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/realisations`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/actualites`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/partenaires`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
    { url: `${siteUrl}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const [services, realisations, news] = await Promise.all([
    db.service.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.realisation.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.newsArticle.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ])

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const realisationRoutes: MetadataRoute.Sitemap = realisations.map((r) => ({
    url: `${siteUrl}/realisations/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${siteUrl}/actualites/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...serviceRoutes, ...realisationRoutes, ...newsRoutes]
}
