import { db } from '@/lib/db'
import { ServiceCard } from '@/components/site/service-card'
import { SectionHeading } from '@/components/site/section-heading'
import { Button } from '@/components/ui/button'
import { Icon } from '@/lib/icon'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos services',
  description:
    'BTP, agro-alimentaire, formation, élevage, froid et sous-traitance : découvrez les six domaines d’intervention de DTK Corporation SARL en Guinée.',
  alternates: { canonical: '/services' },
}

export const revalidate = 60

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { isPublished: true, isSubcontracting: false },
    orderBy: { order: 'asc' },
    include: { _count: { select: { formations: true, products: true } } },
  })

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="bg-ellipse-dtk" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Nos expertises
            </p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Nos services</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">
              Six domaines d’intervention pour accompagner les particuliers, les entreprises
              et les institutions en Guinée.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s as any} index={i} />
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center md:p-8">
            <h2 className="text-xl font-bold">Besoin de sous-traitance ?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              DTK Corporation travaille en sous-traitance dans tous ses domaines d’expertise.
            </p>
            <Button asChild className="mt-4">
              <Link href="/sous-traitance">
                <Icon name="FaHandshake" size={16} className="mr-2" />
                Découvrir la sous-traitance
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
