import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { HeroSlider } from '@/components/site/hero-slider'
import { ServiceCard } from '@/components/site/service-card'
import { PartnersMarquee } from '@/components/site/partners-marquee'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { EmptyState } from '@/components/site/empty-state'
import { RichBackground, HeroDecor, PathLines, DotGrid, FloatingShapes, WaveDivider } from '@/components/site/decor-background'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { whatsappLink } from '@/lib/settings'

export const revalidate = 60

export default async function HomePage() {
  const [slides, services, stats, engagements, realisations, partners, settings] =
    await Promise.all([
      db.slide.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
      db.service.findMany({ where: { isPublished: true, isSubcontracting: false }, orderBy: { order: 'asc' } }),
      db.siteStat.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
      db.engagement.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
      db.realisation.findMany({ where: { isPublished: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' }, take: 3 }),
      db.partner.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
      getSiteSettings(),
    ])

  const wa = whatsappLink(settings?.whatsapp)

  return (
    <>
      {/* ─── Hero slider ─── */}
      {slides.length > 0 ? (
        <HeroSlider slides={slides as any} />
      ) : (
        <section className="relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden bg-primary text-primary-foreground">
          <HeroDecor />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl font-extrabold md:text-5xl">{settings?.siteName}</h1>
            <p className="mt-3 text-lg text-primary-foreground/80">{settings?.slogan}</p>
          </div>
        </section>
      )}

      {/* ─── Intro ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="mx-auto max-w-3xl text-center">
            <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/40" />
              {settings?.siteName || 'DTK Corporation SARL'}
              <span className="h-px w-8 bg-accent/40" />
            </p>
            <h2 className="text-2xl font-bold leading-tight md:text-4xl">
              Une entreprise guinéenne pluridisciplinaire,{' '}
              <span className="text-gradient-dtk">engagée sur ses valeurs</span>
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              DTK Corporation SARL intervient dans six domaines complémentaires — BTP,
              agro-alimentaire, formation, élevage, froid et sous-traitance — au service
              du développement de la Guinée.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/a-propos">
                  <Icon name="FaUsers" size={16} className="mr-2" />
                  En savoir plus
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Faire une demande
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="relative overflow-hidden bg-muted/30 section-padding">
        <DotGrid className="opacity-60" />
        <FloatingShapes />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Nos expertises"
            title="Six domaines d'intervention"
            description="Du BTP au froid, en passant par l'agro-alimentaire et la formation, nous accompagnons les particuliers, les entreprises et les institutions dans toute la Guinée."
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {services.map((s) => (
              <RevealItem key={s.id}>
                <ServiceCard service={s as any} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal direction="up" className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">
                <Icon name="FaList" size={16} className="mr-2" />
                Voir tous les services
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ─── Engagements QHSSE ─── */}
      {engagements.length > 0 && (
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
          <HeroDecor />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Nos engagements"
              title="Politique QHSSE"
              description="Trois principes non négociables qui guident chacune de nos interventions."
            />
            <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
              {engagements.map((e) => (
                <RevealItem key={e.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 text-center backdrop-blur transition-all hover:bg-primary-foreground/10 hover:border-accent/40">
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
                    </div>
                    <div className="relative z-10">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg transition-transform group-hover:scale-110">
                        <Icon name={e.iconKey || 'FaShieldAlt'} size={28} />
                      </div>
                      <h3 className="text-lg font-bold">{e.title}</h3>
                      <p className="mt-2 text-sm text-primary-foreground/80">{e.description}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Chiffres ─── */}
      {stats.length > 0 && (
        <section className="relative overflow-hidden section-padding">
          <PathLines />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
              {stats.map((s) => (
                <RevealItem key={s.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 text-accent transition-transform group-hover:scale-110">
                        <Icon name={s.iconKey || 'FaChartLine'} size={22} />
                      </div>
                      <p className="text-4xl font-extrabold text-gradient-dtk">{s.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Réalisations ─── */}
      {realisations.length > 0 ? (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-50" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Portfolio"
              title="Nos réalisations"
              description="Un aperçu de projets menés par DTK Corporation."
            />
            <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
              {realisations.map((r) => (
                <RevealItem key={r.id}>
                  <Link
                    href={`/realisations/${r.slug}`}
                    className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {r.coverUrl ? (
                        <Image
                          src={r.coverUrl}
                          alt={r.coverAlt || r.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name="FaBuilding" size={48} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      {r.category && (
                        <span className="absolute top-3 left-3 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
                          {r.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold leading-snug group-hover:text-accent transition-colors">{r.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        Découvrir
                        <Icon name="FaArrowRight" size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal direction="up" className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/realisations">
                  <Icon name="FaImages" size={16} className="mr-2" />
                  Voir toutes les réalisations
                </Link>
              </Button>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="relative section-padding">
          <div className="container mx-auto px-4 md:px-6">
            <EmptyState
              icon="FaImages"
              title="Réalisations à venir"
              description="Nos projets seront bientôt mis en ligne. En attendant, découvrez nos services ou contactez-nous."
              actionLabel="Découvrir nos services"
              actionHref="/services"
            />
          </div>
        </section>
      )}

      {/* ─── Partenaires ─── */}
      {partners.length > 0 && (
        <section className="relative overflow-hidden py-16 md:py-20">
          <RichBackground />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Confiance"
              title="Nos partenaires"
              description="Ils nous font confiance."
            />
            <Reveal direction="up" className="mt-10">
              <PartnersMarquee partners={partners as any} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ─── CTA final ─── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/team-pro.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 via-[#101B91]/15 to-[#08A9E8]/25" />
          <HeroDecor />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="scale" className="mx-auto max-w-3xl text-center text-primary-foreground">
            <h2 className="text-3xl font-bold md:text-5xl">
              Un projet en tête ?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90 md:text-xl">
              Demande de devis, inscription à une formation, sous-traitance ou simple
              renseignement : un seul formulaire, un seul point d'entrée.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
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
          </Reveal>
        </div>
        <WaveDivider color="var(--background)" />
      </section>
    </>
  )
}
