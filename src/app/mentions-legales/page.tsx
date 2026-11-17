import { getSiteSettings } from '@/lib/settings'
import { Reveal } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes } from '@/components/site/decor-background'
import { Icon } from '@/lib/icon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site DTK Corporation SARL.',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: true, follow: true },
}

export const revalidate = 60

export default async function LegalPage() {
  const settings = await getSiteSettings()

  return (
    <div className="bg-mesh-dtk">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=60"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101B91]/95 to-[#101B91]/80" />
          <FloatingShapes />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Informations légales
            </p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Mentions légales</h1>
            <p className="mt-3 text-primary-foreground/80">Informations sur l'éditeur, l'hébergement et la propriété intellectuelle.</p>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <article className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <Reveal direction="up">
              <LegalSection icon="FaBuilding" title="Éditeur du site">
                <p>
                  {settings?.legalName || 'DTK Corporation SARL'}
                  {settings?.legalForm ? ` (${settings.legalForm})` : ''}
                </p>
                {settings?.legalAddress && <p>{settings.legalAddress}</p>}
                {settings?.legalCapital && <p>Capital social : {settings.legalCapital}</p>}
                {settings?.legalId && <p>Numéro d'immatriculation : {settings.legalId}</p>}
                {settings?.email && <p>Email : <a href={`mailto:${settings.email}`} className="text-accent hover:underline">{settings.email}</a></p>}
                {settings?.phone && <p>Téléphone : {settings.phone}</p>}
                {!settings?.legalId && !settings?.legalAddress && !settings?.legalCapital && (
                  <p className="italic text-muted-foreground text-sm">
                    Les informations légales détaillées seront complétées après confirmation par l'entreprise.
                  </p>
                )}
              </LegalSection>
            </Reveal>

            <Reveal direction="up" delay={0.05}>
              <LegalSection icon="FaUser" title="Directeur de la publication">
                <p>Le représentant légal de {settings?.legalName || 'DTK Corporation SARL'}.</p>
              </LegalSection>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <LegalSection icon="FaServer" title="Hébergement">
                <p>Ce site est hébergé par Vercel Inc. (ou par l'hébergeur configuré lors du déploiement).</p>
              </LegalSection>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <LegalSection icon="FaShieldAlt" title="Propriété intellectuelle">
                <p>
                  L'ensemble des contenus présents sur ce site (textes, images, logos) est la propriété
                  de {settings?.legalName || 'DTK Corporation SARL'} ou de ses partenaires, sauf mention contraire.
                  Toute reproduction sans autorisation préalable est interdite.
                </p>
                <p className="mt-2">
                  Les images d'illustration proviennent du site Unsplash et sont utilisées conformément
                  à ses conditions d'utilisation.
                </p>
              </LegalSection>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <LegalSection icon="FaLock" title="Données personnelles">
                <p>
                  Les données collectées via les formulaires de ce site sont utilisées uniquement pour
                  traiter vos demandes. Elles ne sont jamais cédées à des tiers. Pour plus d'informations,
                  consultez notre <a href="/confidentialite" className="text-accent hover:underline">politique de confidentialité</a>.
                </p>
              </LegalSection>
            </Reveal>

            <Reveal direction="up" delay={0.25}>
              <LegalSection icon="FaEnvelope" title="Contact">
                <p>
                  Pour toute question relative aux mentions légales, contactez-nous via la{' '}
                  <a href="/contact" className="text-accent hover:underline">page contact</a>.
                </p>
              </LegalSection>
            </Reveal>
          </div>
        </div>
      </article>
    </div>
  )
}

function LegalSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg md:p-8">
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-accent/5 blur-2xl" />
      <div className="relative z-10">
        <h2 className="mb-3 flex items-center gap-3 text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent">
            <Icon name={icon} size={18} />
          </span>
          {title}
        </h2>
        <div className="space-y-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}
