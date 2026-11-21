import { db } from '@/lib/db'
import { getSiteSettings, splitList, parseStringArray } from '@/lib/settings'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes, PathLines, WaveDivider, HeroDecor } from '@/components/site/decor-background'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'DTK Corporation SARL : une entreprise guinéenne pluridisciplinaire. Professionnalisme, Qualité, Satisfaction.',
  alternates: { canonical: '/a-propos' },
}

export const revalidate = 60

export default async function AboutPage() {
  const [settings, engagements, services] = await Promise.all([
    getSiteSettings(),
    db.engagement.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.service.findMany({
      where: { isPublished: true, isSubcontracting: false },
      orderBy: { order: 'asc' },
      select: { slug: true, shortTitle: true, title: true, iconKey: true, coverUrl: true, excerpt: true },
    }),
  ])

  const zones = splitList(settings?.zones)

  const values = [
    { icon: 'FaShieldAlt', title: 'Intégrité', desc: 'Nous agissons avec transparence et honnêteté dans toutes nos relations professionnelles.' },
    { icon: 'FaRocket', title: 'Innovation', desc: 'Nous adoptons les technologies et méthodes modernes pour un développement durable.' },
    { icon: 'FaUsers', title: 'Engagement', desc: 'Nous nous investissons pleinement dans chaque projet, avec passion et détermination.' },
    { icon: 'FaLeaf', title: 'Durabilité', desc: 'Nous minimisons notre impact environnemental et soutenons les communautés locales.' },
  ]

  const stats = [
    { icon: 'FaBuilding', value: '6', label: 'Domaines d\'expertise' },
    { icon: 'FaMapMarkerAlt', value: '4', label: 'Villes d\'intervention' },
    { icon: 'FaUsers', value: 'Haute-Guinée', label: 'Zone agro-alimentaire' },
    { icon: 'FaHandshake', value: '1', label: 'Partenaire de confiance' },
  ]

  return (
    <>
      {/* ─── Hero with diagonal banner ─── */}
      <section className="relative overflow-hidden">
        {/* Background image with diagonal clip */}
        <div className="absolute inset-0">
          <Image
            src="/images/about-team.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/70 via-[#101B91]/70 to-[#08A9E8]/70" />
        </div>
        {/* Diagonal bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 bg-background"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 0 100%)' }}
        />
        {/* Content */}
        <div className="public-hero-copy container relative z-10 mx-auto px-4 py-20 md:px-6 md:py-28">
          <Reveal direction="up">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/70" aria-label="Fil d'Ariane">
              <Link href="/" className="hover:text-accent">Accueil</Link>
              <Icon name="FaChevronRight" size={10} className="text-accent" />
              <span className="text-accent">À propos</span>
            </nav>
            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
              À propos de DTK Corporation
            </h1>
            {/* Cyan accent underline */}
            <div className="mt-4 h-1 w-24 rounded-full bg-accent" />
            <p className="mt-4 max-w-2xl text-lg italic text-white/80 md:text-xl">
              Une entreprise multisectorielle engagée pour le développement durable de la Guinée
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Notre histoire (3 columns) ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-3 lg:items-center">
            {/* Left: photo with cyan offset border */}
            <Reveal direction="right">
              <div className="relative">
                {/* Cyan offset shadow */}
                <div className="absolute -bottom-4 -left-4 h-full w-full rounded-2xl bg-accent/20" />
                {/* Soft blob behind */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 shadow-xl">
                  <Image
                    src="/images/about-team-photo.webp"
                    alt="Équipe DTK Corporation"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </Reveal>

            {/* Center: text */}
            <Reveal direction="up" delay={0.1}>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                  <span className="h-px w-6 bg-accent/60" />
                  Notre histoire
                </p>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                  Bâtir aujourd'hui, pour demain
                </h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground md:text-base">
                  <p>
                    DTK Corporation SARL est une entreprise guinéenne pluridisciplinaire
                    née de la volonté de contribuer au développement économique et social
                    de la Guinée.
                  </p>
                  <p>
                    Intervenant dans six domaines complémentaires — BTP, agro-alimentaire,
                    formation, élevage, froid et sous-traitance — nous accompagnons les
                    particuliers, les entreprises et les institutions sur l'ensemble du
                    territoire guinéen.
                  </p>
                  <p>
                    Notre projet agro-alimentaire vise à transformer et valoriser le riz
                    guinéen en Haute-Guinée (Dinguiraye, Banora, M'Bonet), au plus près
                    des producteurs locaux.
                  </p>
                </div>
                <Button asChild className="mt-5 rounded-full">
                  <Link href="/contact">
                    En savoir plus
                    <Icon name="FaArrowRight" size={14} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            {/* Right: stats column */}
            <Reveal direction="left" delay={0.2}>
              <div className="space-y-4 border-l-2 border-accent/20 pl-6">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent">
                      <Icon name={s.icon} size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Nos valeurs (light blue panel, 4 cards) ─── */}
      <section className="relative overflow-hidden bg-accent/5 section-padding">
        <DotGrid className="opacity-40" />
        <FloatingShapes />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-6 bg-accent/60" />
              Nos valeurs
              <span className="h-px w-6 bg-accent/60" />
            </p>
            <h2 className="text-2xl font-bold md:text-4xl">Les piliers de notre engagement</h2>
            <p className="mt-3 text-muted-foreground">
              Quatre valeurs fondamentales qui guident chacune de nos décisions et de nos interventions.
            </p>
          </Reveal>

          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {values.map((v) => (
              <RevealItem key={v.title}>
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-accent/40">
                  <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-accent/8 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <Icon name={v.icon} size={28} />
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

      {/* ─── Nos secteurs d'activité (angled photo tiles) ─── */}
      <section className="relative overflow-hidden section-padding">
        <PathLines />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: text */}
            <Reveal direction="right">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                <span className="h-px w-6 bg-accent/60" />
                Nos secteurs d'activité
              </p>
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                Une expertise diversifiée pour un développement intégré
              </h2>
              <p className="mt-4 text-muted-foreground">
                Six domaines complémentaires pour accompagner le développement de la Guinée :
                du BTP à l'agro-alimentaire, de la formation au froid, nous offrons des
                solutions complètes à nos clients.
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <Link href="/services">
                  Voir nos activités
                  <Icon name="FaArrowRight" size={14} className="ml-2" />
                </Link>
              </Button>
            </Reveal>

            {/* Right: angled service tiles */}
            <Reveal direction="left" delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {services.slice(0, 4).map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className={`group relative overflow-hidden rounded-xl border border-border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${i % 2 === 0 ? 'mt-0' : 'mt-8'}`}
                    style={{ transform: i % 2 === 0 ? 'skewY(-2deg)' : 'skewY(2deg)' }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      {s.coverUrl ? (
                        <Image src={s.coverUrl} alt={s.shortTitle || s.title} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name={s.iconKey || 'FaBuilding'} size={32} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                        <Icon name={s.iconKey || 'FaBuilding'} size={12} className="text-accent" />
                        <span className="text-xs font-semibold text-white">{s.shortTitle || s.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Section équipe (split photo + text) ─── */}
      <section className="relative overflow-hidden bg-primary py-20 text-white md:py-28">
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: team photo with diagonal cut */}
            <Reveal direction="right">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/about-team-photo.webp"
                  alt="Équipe pluridisciplinaire DTK Corporation"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
                {/* Cyan diagonal slash at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 bg-accent"
                  style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
                />
              </div>
            </Reveal>

            {/* Right: text */}
            <Reveal direction="left" delay={0.1}>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                  <span className="h-px w-6 bg-accent/60" />
                  Notre équipe
                </p>
                <h2 className="text-2xl font-bold leading-tight md:text-4xl">
                  Une équipe engagée et pluridisciplinaire
                </h2>
                <p className="mt-4 text-white/80 md:text-lg">
                  Professionnels du BTP, ingénieurs agronomes, formateurs expérimentés,
                  techniciens en froid et climatisation — nos équipes réunissent les
                  compétences nécessaires pour mener à bien vos projets.
                </p>
                <p className="mt-3 text-white/70">
                  Nous investissons dans la formation continue de nos collaborateurs et
                  dans le développement des jeunes talents guinéens à travers nos
                  programmes de formation de 2 à 3 mois.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90">
                    <Link href="/services/formation">
                      <Icon name="FaGraduationCap" size={16} className="mr-2" />
                      Nos formations
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                    <Link href="/contact">
                      <Icon name="FaPaperPlane" size={16} className="mr-2" />
                      Nous rencontrer
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── QHSSE (from DB) ─── */}
      {engagements.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-50" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="QHSSE"
              title="Notre politique qualité, hygiène, sécurité, environnement"
              description="Trois principes non négociables au cœur de notre démarche."
            />
            <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
              {engagements.map((e) => (
                <RevealItem key={e.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-accent/40">
                    <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-accent/8 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent shadow-lg transition-transform group-hover:scale-110">
                        <Icon name={e.iconKey || 'FaShieldAlt'} size={28} />
                      </div>
                      <h3 className="text-lg font-bold">{e.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-primary py-16 text-white md:py-20">
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <Reveal direction="scale">
            <h2 className="text-2xl font-bold md:text-4xl">Travaillons ensemble</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Confiez-nous votre projet ou demandez un renseignement. Notre équipe vous répond rapidement.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90">
                <Link href="/contact">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Nous contacter
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/services">
                  <Icon name="FaList" size={16} className="mr-2" />
                  Nos services
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
