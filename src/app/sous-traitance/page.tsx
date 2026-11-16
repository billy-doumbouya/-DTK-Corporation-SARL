import { db } from '@/lib/db'
import { parseStringArray } from '@/lib/settings'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sous-traitance',
  description:
    'DTK Corporation SARL travaille en sous-traitance dans tous ses domaines d’expertise : BTP, agro-alimentaire, formation, élevage et froid. Confiez-nous une mission.',
  alternates: { canonical: '/sous-traitance' },
}

export const revalidate = 60

export default async function SubcontractingPage() {
  const page = await db.subcontractingPage.findUnique({ where: { id: 'singleton' } })
  const domains = parseStringArray(page?.domains)

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
        <div className="bg-ellipse-dtk" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Collaboration
            </p>
            <h1 className="text-3xl font-extrabold md:text-5xl">{page?.headline || 'Sous-traitance'}</h1>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-lg text-muted-foreground">{page?.intro}</p>

              {domains.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold">Domaines couverts</h2>
                  <ul className="mt-4 space-y-2">
                    {domains.map((d, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                        <Icon name="FaCheckCircle" size={16} className="text-accent shrink-0" />
                        <span className="text-sm font-medium">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/contact?type=sous-traitance">
                    <Icon name="FaPaperPlane" size={16} className="mr-2" />
                    Confier une mission
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/services">
                    <Icon name="FaList" size={16} className="mr-2" />
                    Voir nos services
                  </Link>
                </Button>
              </div>
            </div>

            {page?.imageUrl && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={page.imageUrl}
                  alt={page.imageAlt || 'Sous-traitance'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
