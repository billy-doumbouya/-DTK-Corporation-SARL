import { db } from '@/lib/db'
import { ServiceCard } from '@/components/site/service-card'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes } from '@/components/site/decor-background'
import { Button } from '@/components/ui/button'
import { Icon } from '@/lib/icon'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos services',
  description:
    "BTP, agro-alimentaire, formation, élevage, froid et sous-traitance : découvrez les six domaines d'intervention de DTK Corporation SARL en Guinée.",
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <img src="/images/services-bg.webp" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/95 via-[#101B91]/85 to-[#08A9E8]/60" />
          <div className="absolute -top-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-[#08A9E8] opacity-[0.15] blur-[120px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Nos expertises
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">Nos services</h1>
            <p className="mt-4 text-lg text-primary-foreground/85 md:text-xl">
              Six domaines d'intervention pour accompagner les particuliers, les entreprises
              et les institutions en Guinée.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {services.map((s) => (
              <RevealItem key={s.id}>
                <ServiceCard service={s as any} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal direction="up" className="mt-12">
            <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-8 text-center md:p-10">
              <FloatingShapes />
              <div className="relative z-10">
                <h2 className="text-xl font-bold md:text-2xl">Besoin de sous-traitance ?</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  DTK Corporation travaille en sous-traitance dans tous ses domaines d'expertise.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/sous-traitance">
                    <Icon name="FaHandshake" size={16} className="mr-2" />
                    Découvrir la sous-traitance
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
