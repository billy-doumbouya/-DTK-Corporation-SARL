import { db } from '@/lib/db'
import { getSiteSettings, splitList } from '@/lib/settings'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { RichBackground, HeroDecor, DotGrid, PathLines } from '@/components/site/decor-background'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'DTK Corporation SARL : une entreprise guinéenne pluridisciplinaire. Professionnalisme, Qualité, Satisfaction. Découvrez notre vision, nos valeurs et notre politique QHSSE.',
  alternates: { canonical: '/a-propos' },
}

export const revalidate = 60

export default async function AboutPage() {
  const [settings, engagements] = await Promise.all([
    getSiteSettings(),
    db.engagement.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    }),
  ])

  const zones = splitList(settings?.zones)
  const values = [
    {
      icon: 'FaAward',
      title: 'Professionnalisme',
      desc: 'Des équipes qualifiées, une méthodologie rigoureuse et un engagement total sur chaque projet.',
    },
    {
      icon: 'FaCheckCircle',
      title: 'Qualité',
      desc: 'Des standards exigeants, un contrôle continu et zéro compromis sur le rendu final.',
    },
    {
      icon: 'FaUsers',
      title: 'Satisfaction',
      desc: 'L’écoute de nos clients au cœur de notre démarche, pour des résultats à la hauteur de vos attentes.',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <img src="/images/about-team.webp" alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 via-[#101B91]/15 to-[#08A9E8]/15" />
        </div>
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              À propos
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">{settings?.siteName || 'DTK Corporation SARL'}</h1>
            <p className="mt-4 text-lg text-primary-foreground/85 md:text-xl">
              {settings?.slogan}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Présentation */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Notre entreprise"
                title="Une entreprise guinéenne au service du développement"
                align="left"
              />
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  DTK Corporation SARL est une entreprise guinéenne pluridisciplinaire
                  intervenant dans six domaines complémentaires : BTP, agro-alimentaire,
                  formation, élevage, froid (climatisation) et sous-traitance.
                </p>
                <p>
                  Nous accompagnons les particuliers, les entreprises et les institutions
                  sur l’ensemble du territoire guinéen, avec une présence forte à Conakry,
                  Kankan, Siguiri et Dinguiraye.
                </p>
                <p>
                  Notre projet agro-alimentaire vise à transformer et valoriser le riz
                  guinéen et les produits agricoles locaux en Haute-Guinée
                  (Dinguiraye, Banora, M’Bonet), au plus près des producteurs.
                </p>
                <p>
                  Notre engagement : allier professionnalisme, qualité et satisfaction
                  sur chacune de nos interventions, dans le respect strict de notre
                  politique QHSSE.
                </p>
              </div>
              {zones.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {zones.map((z) => (
                    <span key={z} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      <Icon name="FaMapMarkerAlt" size={10} />
                      {z}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="bg-ellipse-dtk" aria-hidden="true" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {[
                  { icon: 'FaBuilding', label: 'BTP' },
                  { icon: 'FaSeedling', label: 'Agro-alimentaire' },
                  { icon: 'FaGraduationCap', label: 'Formation' },
                  { icon: 'FaPaw', label: 'Élevage' },
                  { icon: 'FaSnowflake', label: 'Froid' },
                  { icon: 'FaHandshake', label: 'Sous-traitance générale' },
                ].map((d) => (
                  <div key={d.label} className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
                    <Icon name={d.icon} size={28} className="mx-auto text-accent" />
                    <p className="mt-2 text-sm font-semibold">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="relative overflow-hidden bg-muted/30 section-padding">
        <DotGrid className="opacity-60" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Nos valeurs"
            title="Professionnalisme, Qualité, Satisfaction"
            description="Trois valeurs qui guident chacune de nos décisions et de nos interventions."
          />
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {values.map((v) => (
              <RevealItem key={v.title}>
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 text-accent transition-transform group-hover:scale-110">
                      <Icon name={v.icon} size={24} />
                    </div>
                    <h3 className="text-lg font-bold">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* QHSSE */}
      {engagements.length > 0 && (
        <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
          <div className="bg-ellipse-dtk" aria-hidden="true" />
          <div className="container relative mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="QHSSE"
              title="Notre politique qualité, hygiène, sécurité, environnement"
              description="Trois principes non négociables au cœur de notre démarche."
            />
            <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
              {engagements.map((e) => (
                <RevealItem key={e.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 text-center backdrop-blur transition-all hover:bg-primary-foreground/10 hover:border-accent/40">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg transition-transform group-hover:scale-110">
                      <Icon name={e.iconKey || 'FaShieldAlt'} size={28} />
                    </div>
                    <h3 className="text-lg font-bold">{e.title}</h3>
                    <p className="mt-2 text-sm text-primary-foreground/80">{e.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">Travaillons ensemble</h2>
            <p className="mt-3 text-muted-foreground">
              Confiez-nous votre projet ou demandez un renseignement. Notre équipe vous répond rapidement.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/contact">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Nous contacter
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services">
                  <Icon name="FaList" size={16} className="mr-2" />
                  Nos services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
