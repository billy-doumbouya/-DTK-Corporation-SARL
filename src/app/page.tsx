import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { HeroSlider } from '@/components/site/hero-slider'
import { ServiceCard } from '@/components/site/service-card'
import { PartnersMarquee } from '@/components/site/partners-marquee'
import { SectionHeading } from '@/components/site/section-heading'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { whatsappLink } from '@/lib/settings'

export const revalidate = 60

export default async function HomePage() {
  const [slides, services, stats, engagements, realisations, partners, settings] =
    await Promise.all([
      db.slide.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
      db.service.findMany({
        where: { isPublished: true, isSubcontracting: false },
        orderBy: { order: 'asc' },
      }),
      db.siteStat.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
      db.engagement.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
      db.realisation.findMany({
        where: { isPublished: true, publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      }),
      db.partner.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
      getSiteSettings(),
    ])

  const wa = whatsappLink(settings?.whatsapp)

  return (
    <>
      {/* Hero slider */}
      {slides.length > 0 ? (
        <HeroSlider slides={slides as any} />
      ) : (
        <section className="relative flex h-[60vh] min-h-[420px] items-center justify-center bg-primary text-primary-foreground">
          <div className="bg-ellipse-dtk" aria-hidden="true" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl font-extrabold md:text-5xl">{settings?.siteName}</h1>
            <p className="mt-3 text-lg text-primary-foreground/80">{settings?.slogan}</p>
          </div>
        </section>
      )}

      {/* Intro / présentation courte */}
      <section className="relative py-16 md:py-24">
        <div className="bg-grid-dtk absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
              {settings?.siteName || 'DTK Corporation SARL'}
            </p>
            <h2 className="text-2xl font-bold leading-tight md:text-4xl">
              Une entreprise guinéenne pluridisciplinaire, engagée sur ses valeurs
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              DTK Corporation SARL intervient dans six domaines complémentaires — BTP,
              agro-alimentaire, formation, élevage, froid et sous-traitance — au service
              du développement de la Guinée. Notre slogan guide chacune de nos interventions :
              <span className="font-semibold text-foreground"> Professionnalisme, Qualité, Satisfaction.</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/a-propos">
                  <Icon name="FaUsers" size={16} className="mr-2" />
                  En savoir plus sur nous
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Faire une demande
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Nos expertises"
            title="Six domaines d'intervention"
            description="Du BTP au froid, en passant par l'agro-alimentaire et la formation, nous accompagnons les particuliers, les entreprises et les institutions dans toute la Guinée."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s as any} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">
                <Icon name="FaList" size={16} className="mr-2" />
                Voir tous les services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Engagements QHSSE */}
      {engagements.length > 0 && (
        <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
          <div className="bg-ellipse-dtk" aria-hidden="true" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
                Nos engagements
              </p>
              <h2 className="text-2xl font-bold md:text-4xl">Politique QHSSE</h2>
              <p className="mt-3 text-primary-foreground/80 md:text-lg">
                Trois principes non négociables qui guident chacune de nos interventions.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {engagements.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 text-center backdrop-blur"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon name={e.iconKey || 'FaShieldAlt'} size={24} />
                  </div>
                  <h3 className="text-lg font-bold">{e.title}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/80">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chiffres (only if published) */}
      {stats.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon name={s.iconKey || 'FaChartLine'} size={20} />
                  </div>
                  <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Réalisations preview */}
      {realisations.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Portfolio"
              title="Nos réalisations"
              description="Un aperçu de projets menés par DTK Corporation."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {realisations.map((r) => (
                <Link
                  key={r.id}
                  href={`/realisations/${r.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden">
                    {r.coverUrl ? (
                      <Image
                        src={r.coverUrl}
                        alt={r.coverAlt || r.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/10">
                        <Icon name="FaBuilding" size={48} className="text-primary/40" />
                      </div>
                    )}
                    {r.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
                        {r.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold leading-snug group-hover:text-accent transition-colors">{r.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/realisations">
                  <Icon name="FaImages" size={16} className="mr-2" />
                  Voir toutes les réalisations
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Confiance"
              title="Nos partenaires"
              description="Ils nous font confiance."
            />
            <div className="mt-10">
              <PartnersMarquee partners={partners as any} />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#08A9E8] py-16 text-primary-foreground md:py-24">
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl">
              Un projet en tête ? Parlons-en.
            </h2>
            <p className="mt-3 text-primary-foreground/90 md:text-lg">
              Demande de devis, inscription à une formation, sous-traitance ou simple
              renseignement : un seul formulaire, un seul point d'entrée.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Faire une demande
                </Link>
              </Button>
              {wa && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1da851] text-white border-0">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <Icon name="FaWhatsapp" size={18} className="mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
