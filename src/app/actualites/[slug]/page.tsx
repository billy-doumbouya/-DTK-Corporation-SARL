import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const items = await db.newsArticle.findMany({ where: { isPublished: true }, select: { slug: true } })
    return items.map((i) => ({ slug: i.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await db.newsArticle.findUnique({ where: { slug } })
  if (!item) return { title: 'Article introuvable' }
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/actualites/${slug}` },
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.excerpt,
      publishedTime: item.publishedAt.toISOString(),
      authors: [item.authorName],
      images: item.coverUrl ? [{ url: item.coverUrl }] : [],
    },
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await db.newsArticle.findUnique({ where: { slug } })

  if (!item || !item.isPublished || item.publishedAt > new Date()) notFound()

  return (
    <>
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {item.coverUrl ? (
          <Image src={item.coverUrl} alt={item.coverAlt || item.title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary">
            <Icon name="FaNewspaper" size={64} className="text-primary-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/40 to-transparent" />
        <div className="relative z-10 flex h-full items-end">
          <div className="public-hero-copy container mx-auto px-4 pb-12 md:px-6">
            <nav className="mb-3 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Link href="/" className="hover:text-accent">Accueil</Link>
              <Icon name="FaChevronRight" size={10} />
              <Link href="/actualites" className="hover:text-accent">Actualités</Link>
              <Icon name="FaChevronRight" size={10} />
              <span className="text-accent line-clamp-1">{item.title}</span>
            </nav>
            <h1 className="max-w-3xl text-3xl font-extrabold text-primary-foreground md:text-5xl">{item.title}</h1>
          </div>
        </div>
      </section>

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Icon name="FaCalendarAlt" size={14} className="text-accent" />
                {new Date(item.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="FaUser" size={14} className="text-accent" />
                {item.authorName}
              </span>
            </div>

            <p className="mt-6 text-lg text-muted-foreground">{item.excerpt}</p>

            <div className="mt-8 whitespace-pre-line text-foreground">{item.content}</div>

            {item.tags && (
              <div className="mt-8 flex flex-wrap gap-2">
                {item.tags.split(/[,;|]/).map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                    <Icon name="FaTag" size={10} />
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 border-t pt-6">
              <Button asChild variant="outline">
                <Link href="/actualites">
                  <Icon name="FaArrowLeft" size={14} className="mr-2" />
                  Toutes les actualités
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
