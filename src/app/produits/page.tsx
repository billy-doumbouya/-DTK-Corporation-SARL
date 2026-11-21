import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/site/section-heading'
import { EmptyState } from '@/components/site/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos produits',
  description:
    'Produits agro-alimentaires (riz guinéen transformé) et produits de l’élevage — valorisés par DTK Corporation SARL en Guinée.',
  alternates: { canonical: '/produits' },
}

export const revalidate = 60

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: { service: { select: { shortTitle: true, title: true } } },
  })

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <Image src="/images/produits-template.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 to-[#101B91]/20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Catalogue
            </p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Nos produits</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">
              Produits agro-alimentaires et de l’élevage, valorisés en Guinée.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {products.length === 0 ? (
            <EmptyState
              icon="FaTag"
              title="Produits à venir"
              description="Notre catalogue produits sera publié prochainement. En attendant, contactez-nous pour toute demande spécifique — nous vous répondons rapidement."
              actionLabel="Nous contacter"
              actionHref="/contact"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/produits/${p.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/40"
                >
                  <div className="relative h-48 overflow-hidden">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.imageAlt || p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/10">
                        <Icon name="FaTag" size={40} className="text-primary/30" />
                      </div>
                    )}
                    {p.service && (
                      <span className="absolute top-3 left-3 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
                        {p.service.shortTitle || p.service.title}
                      </span>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all group-hover:bg-primary/30 group-hover:opacity-100">
                      <span className="rounded-lg bg-background px-3 py-1.5 text-sm font-medium">
                        Voir le produit
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold group-hover:text-accent transition-colors">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                    {p.unit && (
                      <p className="mt-2 text-xs text-muted-foreground">Conditionnement : {p.unit}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
