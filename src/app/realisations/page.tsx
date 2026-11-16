import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/site/section-heading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réalisations',
  description: 'Découvrez les réalisations de DTK Corporation SARL : projets BTP, agro-alimentaire, froid et plus encore en Guinée.',
  alternates: { canonical: '/realisations' },
}

export const revalidate = 60

const PAGE_SIZE = 9

export default async function RealisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const category = sp.category

  const where = {
    isPublished: true,
    publishedAt: { lte: new Date() },
    ...(category ? { category } : {}),
  }

  const [total, realisations, categories] = await Promise.all([
    db.realisation.count({ where }),
    db.realisation.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.realisation.findMany({
      where: { isPublished: true },
      distinct: ['category'],
      select: { category: true },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="bg-ellipse-dtk" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Portfolio</p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Nos réalisations</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">Un aperçu de nos projets en Guinée.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Category filter */}
          {categories.length > 1 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Link
                href="/realisations"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!category ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-accent/10'}`}
              >
                Toutes
              </Link>
              {categories.map((c) => c.category && (
                <Link
                  key={c.category}
                  href={`/realisations?category=${encodeURIComponent(c.category)}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === c.category ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-accent/10'}`}
                >
                  {c.category}
                </Link>
              ))}
            </div>
          )}

          {realisations.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
              <Icon name="FaImages" size={40} className="mx-auto text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-bold">Réalisations à venir</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Les réalisations seront publiées prochainement.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {realisations.map((r) => (
                  <Link
                    key={r.id}
                    href={`/realisations/${r.slug}`}
                    className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {r.coverUrl ? (
                        <Image src={r.coverUrl} alt={r.coverAlt || r.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name="FaBuilding" size={40} className="text-primary/30" />
                        </div>
                      )}
                      {r.category && (
                        <span className="absolute top-3 left-3 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">{r.category}</span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold group-hover:text-accent transition-colors">{r.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                      {r.location && (
                        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="FaMapMarkerAlt" size={10} />
                          {r.location}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link href={`/realisations?page=${page - 1}${category ? `&category=${category}` : ''}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                      <Icon name="FaArrowLeft" size={14} />
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
                  {page < totalPages && (
                    <Link href={`/realisations?page=${page + 1}${category ? `&category=${category}` : ''}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
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
