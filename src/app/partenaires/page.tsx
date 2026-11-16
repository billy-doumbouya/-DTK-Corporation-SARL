import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos partenaires',
  description: 'Ils nous font confiance : découvrez les partenaires de DTK Corporation SARL.',
  alternates: { canonical: '/partenaires' },
}

export const revalidate = 60

export default async function PartnersPage() {
  const partners = await db.partner.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  })

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="bg-ellipse-dtk" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Confiance</p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Nos partenaires</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">Ils nous font confiance.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {partners.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
              <Icon name="FaHandshake" size={40} className="mx-auto text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-bold">Partenaires à venir</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nos partenaires seront affichés ici prochainement.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md"
                >
                  {p.logoUrl ? (
                    <div className="relative h-16 w-full">
                      <Image src={p.logoUrl} alt={p.name} fill sizes="(max-width:768px) 100vw, 25vw" className="object-contain" />
                    </div>
                  ) : (
                    <Icon name="FaHandshake" size={32} className="text-muted-foreground/40" />
                  )}
                  <p className="mt-3 text-sm font-semibold">{p.name}</p>
                  {p.websiteUrl && (
                    <a
                      href={p.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <Icon name="FaExternalLinkAlt" size={10} />
                      Site web
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
