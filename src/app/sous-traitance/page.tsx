import { db } from '@/lib/db'
import { parseStringArray } from '@/lib/settings'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { HeroDecor, RichBackground, PathLines, FloatingShapes, WaveDivider, DotGrid } from '@/components/site/decor-background'
import { SectionHeading } from '@/components/site/section-heading'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sous-traitance générale',
  description: "DTK Corporation SARL travaille en sous-traitance dans tous ses domaines d'expertise. Crédentials, références et cadre juridique.",
  alternates: { canonical: '/sous-traitance' },
}

export const revalidate = 60

const CATEGORY_LABELS: Record<string, string> = {
  legal: 'Juridique',
  insurance: 'Assurance',
  financial: 'Financier',
  certification: 'Certification',
}

const CATEGORY_COLORS: Record<string, string> = {
  legal: 'bg-blue-100 text-blue-700 border-blue-200',
  insurance: 'bg-purple-100 text-purple-700 border-purple-200',
  financial: 'bg-green-100 text-green-700 border-green-200',
  certification: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default async function SubcontractingPage() {
  const [page, credentials, references] = await Promise.all([
    db.subcontractingPage.findUnique({ where: { id: 'singleton' } }),
    db.subcontractingCredential.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.subcontractingReference.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
  ])

  const domains = parseStringArray(page?.domains)

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[55vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          {page?.imageUrl ? (
            <Image src={page.imageUrl} alt={page.imageAlt || 'Sous-traitance'} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <Image src="/images/sous-traitance-template.webp" alt="" fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/70 via-[#101B91]/70 to-[#08A9E8]/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20 md:px-6 md:py-28">
          <Reveal direction="up" className="public-hero-copy max-w-3xl text-white">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Collaboration
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">{page?.headline || 'Sous-traitance générale'}</h1>
            <div className="mt-4 h-1 w-24 rounded-full bg-accent" />
            <p className="mt-4 text-lg text-white/90 md:text-xl">
              Un partenaire de confiance pour vos missions en Guinée. Cadre juridique clair, assurances professionnelles, équipe qualifiée.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                <Link href="/contact?type=sous-traitance">
                  <Icon name="FaPaperPlane" size={16} className="mr-2" />
                  Confier une mission
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <WaveDivider color="var(--background)" />
      </section>

      {/* ─── Trust banner (credentials quick stats) ─── */}
      {credentials.length > 0 && (
        <section className="relative -mt-8 px-4 md:px-6">
          <div className="container mx-auto">
            <Reveal direction="up">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {credentials.slice(0, 4).map((c) => (
                  <div key={c.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110">
                      <Icon name={c.iconKey || 'FaShieldAlt'} size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                      <p className="truncate text-sm font-semibold">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ─── Intro + Domains ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal direction="right">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                <span className="h-px w-6 bg-accent/60" />
                Notre approche
              </p>
              <h2 className="text-2xl font-bold leading-tight md:text-4xl">
                Un partenaire de confiance pour vos missions
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">{page?.intro}</p>
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
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">{i + 1}</span>
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

      {/* ─── Crédentials & Conformité ─── */}
      {credentials.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-50" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Conformité"
              title="Crédentials & informations institutionnelles"
              description="Transparence totale sur notre statut juridique, nos assurances et notre capacité opérationnelle."
            />
            <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
              {credentials.map((c) => (
                <RevealItem key={c.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                    <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-accent/8 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110">
                          <Icon name={c.iconKey || 'FaShieldAlt'} size={18} />
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[c.category] || ''}`}>
                          {CATEGORY_LABELS[c.category] || c.category}
                        </span>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                      <p className="mt-1 text-sm font-semibold">{c.value}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Capacité & Cadre juridique ─── */}
      {(page?.capacity || page?.insuranceInfo || page?.legalFramework) && (
        <section className="relative overflow-hidden section-padding">
          <PathLines />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Capacité"
              title="Notre capacité opérationnelle"
              description="Les ressources, assurances et cadre juridique qui garantissent le succès de vos missions."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {page?.capacity && (
                <Reveal direction="up">
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent">
                      <Icon name="FaUsers" size={22} />
                    </div>
                    <h3 className="font-bold">Capacité opérationnelle</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{page.capacity}</p>
                  </div>
                </Reveal>
              )}
              {page?.insuranceInfo && (
                <Reveal direction="up" delay={0.1}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent">
                      <Icon name="FaShieldAlt" size={22} />
                    </div>
                    <h3 className="font-bold">Assurances professionnelles</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{page.insuranceInfo}</p>
                  </div>
                </Reveal>
              )}
              {page?.legalFramework && (
                <Reveal direction="up" delay={0.2}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent">
                      <Icon name="FaFileAlt" size={22} />
                    </div>
                    <h3 className="font-bold">Cadre juridique</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{page.legalFramework}</p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Références / Missions ─── */}
      {references.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-40" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="Références"
              title="Missions de sous-traitance"
              description="Un aperçu des missions confiées à DTK Corporation. La confidentialité de nos donneurs d'ordre est respectée."
            />
            <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2" stagger={0.1}>
              {references.map((r) => (
                <RevealItem key={r.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon name="FaBuilding" size={14} className="text-accent" />
                          <span className="font-semibold">{r.clientName}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{r.domain}</Badge>
                          <Badge variant="outline">{r.missionType}</Badge>
                          {r.status === 'ongoing' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                              En cours
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              <Icon name="FaCheck" size={8} />
                              Livré
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {r.duration && <p className="text-xs text-muted-foreground">{r.duration}</p>}
                        {r.location && <p className="text-xs text-muted-foreground">{r.location}</p>}
                      </div>
                    </div>
                    {r.scope && (
                      <p className="mt-3 text-sm text-muted-foreground">{r.scope}</p>
                    )}
                    {r.testimonial && (
                      <div className="mt-4 rounded-xl bg-muted/40 p-4">
                        <Icon name="FaQuoteLeft" size={14} className="text-accent mb-1" />
                        <p className="text-sm italic text-muted-foreground">{r.testimonial}</p>
                      </div>
                    )}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Process steps ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
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
              { icon: 'FaHandshake', title: '2. Échange', desc: 'Nous analysons votre besoin et proposons un cadre clair avec devis.' },
              { icon: 'FaCog', title: '3. Exécution', desc: 'Nos équipes interviennent selon le planning et les standards convenus.' },
              { icon: 'FaCheckCircle', title: '4. Livraison', desc: 'Vous recevez le résultat conforme, avec suivi qualité et reporting.' },
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
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <Reveal direction="scale">
            <h2 className="text-2xl font-bold md:text-4xl">Prêt à collaborer ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Confiez-nous votre mission dès maintenant. Cadre juridique clair, équipes qualifiées, réponse rapide.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full bg-white text-primary hover:bg-white/90">
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
