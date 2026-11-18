import { db } from '@/lib/db'
import { parseStringArray } from '@/lib/settings'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { HeroDecor, RichBackground, PathLines, FloatingShapes, WaveDivider } from '@/components/site/decor-background'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sous-traitance générale',
  description:
    "DTK Corporation SARL travaille en sous-traitance dans tous ses domaines d'expertise : BTP, agro-alimentaire, formation, élevage et froid. Confiez-nous une mission.",
  alternates: { canonical: '/sous-traitance' },
}

export const revalidate = 60

export default async function SubcontractingPage() {
  const page = await db.subcontractingPage.findUnique({ where: { id: 'singleton' } })
  const domains = parseStringArray(page?.domains)

  return (
    <>
      {/* ─── Hero with background image ─── */}
      <section className="relative flex min-h-[55vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          {page?.imageUrl ? (
            <Image src={page.imageUrl} alt={page.imageAlt || 'Sous-traitance générale'} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <img
              src="/images/subcontracting-bg.webp"
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 via-[#101B91]/15 to-[#08A9E8]/15" />
          <HeroDecor />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20 md:px-6 md:py-28">
          <Reveal direction="up" className="max-w-3xl text-primary-foreground">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Collaboration
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">{page?.headline || 'Sous-traitance générale'}</h1>
            <p className="mt-4 text-lg text-primary-foreground/90 md:text-xl">
              Confiez-nous une mission dans nos domaines d'expertise. Nous répondons rapidement avec un cadre clair.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link href="/contact?type=sous-traitance">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Confier une mission
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/services">
                  <Icon name="FaList" size={16} className="mr-2" />
                  Nos services
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <WaveDivider color="var(--background)" />
      </section>

      {/* ─── Intro + Domains ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal direction="right">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                <span className="h-px w-8 bg-accent/60" />
                Notre approche
              </p>
              <h2 className="text-2xl font-bold leading-tight md:text-4xl">
                Un partenaire de confiance pour vos missions
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">{page?.intro}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/contact?type=sous-traitance">
                    <Icon name="FaPaperPlane" size={14} className="mr-2" />
                    Confier une mission
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl md:p-8">
                <FloatingShapes />
                <div className="relative z-10">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Icon name="FaHandshake" size={18} className="text-accent" />
                    Domaines couverts
                  </h3>
                  {domains.length > 0 ? (
                    <ul className="space-y-3">
                      {domains.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-accent/40 hover:bg-accent/5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                            {i + 1}
                          </span>
                          <span className="font-medium">{d}</span>
                          <Icon name="FaCheckCircle" size={14} className="ml-auto text-accent" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Domaines à renseigner.</p>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Process steps ─── */}
      <section className="relative overflow-hidden bg-muted/30 section-padding">
        <PathLines />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/40" />
              Comment ça marche
              <span className="h-px w-8 bg-accent/40" />
            </p>
            <h2 className="text-2xl font-bold md:text-4xl">Un processus simple et transparent</h2>
          </Reveal>
          <RevealGroup className="grid gap-6 md:grid-cols-4" stagger={0.1}>
            {[
              { icon: 'FaFileAlt', title: '1. Décrivez', desc: 'Remplissez le formulaire dédié avec le détail de la mission à confier.' },
              { icon: 'FaHandshake', title: '2. Échange', desc: 'Nous analysons votre besoin et vous proposons un cadre de collaboration clair.' },
              { icon: 'FaCog', title: '3. Exécution', desc: 'Nos équipes interviennent selon le planning et les standards convenus.' },
              { icon: 'FaCheckCircle', title: '4. Livraison', desc: 'Vous recevez le résultat conforme à vos attentes, avec un suivi qualité.' },
            ].map((step, i) => (
              <RevealItem key={i}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110">
                      <Icon name={step.icon} size={24} />
                    </div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <Reveal direction="scale">
            <h2 className="text-2xl font-bold md:text-4xl">Prêt à collaborer ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Confiez-nous votre mission dès maintenant. Un seul formulaire, une réponse rapide.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-primary hover:bg-white/90">
              <Link href="/contact?type=sous-traitance">
                <Icon name="FaPaperPlane" size={16} className="mr-2" />
                Démarrer une mission
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
