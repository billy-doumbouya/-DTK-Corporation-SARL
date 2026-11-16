import { db } from '@/lib/db'
import { getSiteSettings, whatsappLink, splitList } from '@/lib/settings'
import { RequestForm } from '@/components/site/request-form'
import { SectionHeading } from '@/components/site/section-heading'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact & demande',
  description:
    'Contactez DTK Corporation SARL : demande de devis, inscription à une formation, sous-traitance, renseignements. Un seul formulaire pour tous vos besoins.',
  alternates: { canonical: '/contact' },
}

export const revalidate = 60

export default async function ContactPage() {
  const [settings, services, formations] = await Promise.all([
    getSiteSettings(),
    db.service.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: { slug: true, shortTitle: true, title: true },
    }),
    db.formation.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true },
    }),
  ])

  const wa = whatsappLink(settings?.whatsapp)
  const zones = splitList(settings?.zones)

  const serviceOptions = services.map((s) => ({
    value: s.slug,
    label: s.shortTitle || s.title,
  }))
  const formationOptions = formations.map((f) => ({ value: f.slug, label: f.title }))

  return (
    <div className="bg-grid-dtk">
      {/* Header */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
        <div className="bg-ellipse-dtk" aria-hidden="true" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Contact
            </p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Parlons de votre projet</h1>
            <p className="mt-3 text-lg text-primary-foreground/85">
              Un seul formulaire pour tous vos besoins : devis, inscription, sous-traitance,
              renseignements. Notre équipe vous répond rapidement.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
              <RequestForm
                services={serviceOptions}
                formations={formationOptions}
                whatsappLink={wa}
              />
            </Suspense>
          </div>

          {/* Sidebar: coordinates */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Nos coordonnées</h2>
              <ul className="space-y-3 text-sm">
                {settings?.email && (
                  <ContactRow icon="FaEnvelope" label="Email">
                    <a href={`mailto:${settings.email}`} className="text-accent hover:underline break-all">
                      {settings.email}
                    </a>
                  </ContactRow>
                )}
                {settings?.phone && (
                  <ContactRow icon="FaPhone" label="Téléphone">
                    <a href={`tel:${settings.phone}`} className="text-accent hover:underline">
                      {settings.phone}
                    </a>
                  </ContactRow>
                )}
                {(settings?.addressLine || settings?.addressCity) && (
                  <ContactRow icon="FaMapMarkerAlt" label="Adresse">
                    <span>
                      {settings?.addressLine}
                      {settings?.addressLine && settings?.addressCity ? ', ' : ''}
                      {settings?.addressCity}
                    </span>
                  </ContactRow>
                )}
                {zones.length > 0 && (
                  <ContactRow icon="FaGlobe" label="Zones d’intervention">
                    <span>{zones.join(', ')}</span>
                  </ContactRow>
                )}
              </ul>
              {wa && (
                <Button asChild className="mt-4 w-full bg-[#25D366] hover:bg-[#1da851] text-white">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <Icon name="FaWhatsapp" size={18} className="mr-2" />
                    Écrire sur WhatsApp
                  </a>
                </Button>
              )}
              {!settings?.email && !settings?.phone && !wa && !settings?.addressLine && (
                <p className="text-xs text-muted-foreground">
                  Les coordonnées seront affichées ici dès qu’elles seront renseignées par
                  l’entreprise.
                </p>
              )}
            </div>

            {/* Social */}
            {(settings?.facebookUrl || settings?.linkedinUrl || settings?.instagramUrl) && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-bold">Réseaux sociaux</h2>
                <div className="flex gap-3">
                  {settings?.facebookUrl && (
                    <SocialLink href={settings.facebookUrl} icon="FaFacebookF" label="Facebook" />
                  )}
                  {settings?.linkedinUrl && (
                    <SocialLink href={settings.linkedinUrl} icon="FaLinkedinIn" label="LinkedIn" />
                  )}
                  {settings?.instagramUrl && (
                    <SocialLink href={settings.instagramUrl} icon="FaInstagram" label="Instagram" />
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
              <div className="mb-2 flex items-center gap-2 text-accent">
                <Icon name="FaInfoCircle" size={18} />
                <span className="font-semibold">Astuce</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pour une réponse plus rapide, utilisez le bouton WhatsApp si disponible.
                Pour les demandes de devis, précisez le lieu et le délai souhaité.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function ContactRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon name={icon} size={16} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
    >
      <Icon name={icon} size={16} />
    </a>
  )
}
