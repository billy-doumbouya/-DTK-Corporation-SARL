import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import Image from 'next/image'
import Link from 'next/link'
import { EmptyState } from '@/components/site/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Suivez l’actualité de DTK Corporation SARL : projets, événements, nouveautés et initiatives en Guinée.',
  alternates: { canonical: '/actualites' },
}

export const revalidate = 60

const PAGE_SIZE = 9

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || '1', 10))

  const where = { isPublished: true, publishedAt: { lte: new Date() } }
  const [total, articles] = await Promise.all([
    db.newsArticle.count({ where }),
    db.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="absolute inset-0">
          <img src="/images/abstract-waves.webp" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/95 to-[#08A9E8]/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Blog</p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Actualités</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">L'actualité de DTK Corporation.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {articles.length === 0 ? (
            <EmptyState
              icon="FaNewspaper"
              title="Aucune actualité pour le moment"
              description="Les actualités seront publiées très prochainement. Revenez bientôt nous visiter, ou découvrez nos services en attendant."
              actionLabel="Découvrir nos services"
              actionHref="/services"
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <Link
                    key={a.id}
                    href={`/actualites/${a.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {a.coverUrl ? (
                        <Image src={a.coverUrl} alt={a.coverAlt || a.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name="FaNewspaper" size={40} className="text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="FaCalendarAlt" size={12} />
                        {new Date(a.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <h3 className="mt-2 font-bold leading-snug group-hover:text-accent transition-colors">{a.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
                      <span className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                        Lire la suite
                        <Icon name="FaArrowRight" size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link href={`/actualites?page=${page - 1}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                      <Icon name="FaArrowLeft" size={14} />
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
                  {page < totalPages && (
                    <Link href={`/actualites?page=${page + 1}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                      <Icon name="FaArrowRight" size={14} />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
