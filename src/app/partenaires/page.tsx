import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import Image from 'next/image'
import { EmptyState } from '@/components/site/empty-state'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes, PathLines } from '@/components/site/decor-background'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <img src="/images/partners-template.webp" alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 to-[#101B91]/20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Confiance
            </p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Nos partenaires</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">Ils nous font confiance et accompagnent notre développement.</p>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="relative -mt-8 px-4 md:px-6">
        <div className="container mx-auto">
          <Reveal direction="up">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-lg">
                <p className="text-3xl font-bold text-gradient-dtk">{partners.length}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Partenaires actifs</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-lg">
                <p className="text-3xl font-bold text-gradient-dtk">6</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Domaines d'expertise</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-lg">
                <p className="text-3xl font-bold text-gradient-dtk">4</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Villes d'intervention</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Partners grid */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          {partners.length === 0 ? (
            <EmptyState
              icon="FaHandshake"
              title="Partenaires à venir"
              description="Nos partenaires seront affichés ici prochainement. Vous souhaitez collaborer avec DTK Corporation ? Contactez-nous pour discuter d'un partenariat."
              actionLabel="Nous contacter"
              actionHref="/contact"
            />
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold md:text-3xl">Ils nous font confiance</h2>
                <p className="mt-2 text-muted-foreground">Institutions, organisations et entreprises qui collaborent avec DTK Corporation.</p>
              </div>
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
                {partners.map((p) => (
                  <RevealItem key={p.id}>
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                      {/* Decorative corner */}
                      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-accent/8 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

                      {/* Logo area */}
                      <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 transition-all group-hover:from-accent/15 group-hover:to-primary/15">
                        {p.logoUrl ? (
                          <Image src={p.logoUrl} alt={p.name} width={48} height={48} className="h-12 w-auto object-contain" />
                        ) : (
                          // Placeholder: first letter in a styled circle
                          <span className="text-2xl font-bold text-gradient-dtk">
                            {p.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold leading-snug transition-colors group-hover:text-accent">{p.name}</h3>

                      {p.websiteUrl && (
                        <a
                          href={p.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                        >
                          <Icon name="FaExternalLinkAlt" size={12} />
                          Visiter le site
                        </a>
                      )}

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </section>

      {/* CTA become a partner */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <img src="/images/subcontracting-bg.webp" alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 to-[#08A9E8]/20" />
          <FloatingShapes />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <Reveal direction="scale">
            <h2 className="text-2xl font-bold md:text-4xl">Devenir partenaire</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Vous êtes une institution, une entreprise ou une ONG ? Rejoignez nos partenaires et construisons ensemble l'avenir de la Guinée.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-primary hover:bg-white/90">
              <Link href="/contact?type=renseignements">
                <Icon name="FaHandshake" size={16} className="mr-2" />
                Nous contacter
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
