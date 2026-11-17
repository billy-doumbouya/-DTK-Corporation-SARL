import { db } from '@/lib/db'
import { getSiteSettings, whatsappLink, splitList } from '@/lib/settings'
import { RequestForm } from '@/components/site/request-form'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal } from '@/components/site/reveal'
import { RichBackground, HeroDecor, DotGrid, PathLines, FloatingShapes } from '@/components/site/decor-background'
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

  const serviceOptions = services.map((s) => ({ value: s.slug, label: s.shortTitle || s.title }))
  const formationOptions = formations.map((f) => ({ value: f.slug, label: f.title }))

  // Map center: Conakry, Guinea by default, or use settings address
  const mapQuery = encodeURIComponent(
    settings?.addressCity
      ? `${settings.addressLine}, ${settings.addressCity}, Guinea`
      : 'Conakry, Guinea'
  )

  return (
    <div className="bg-mesh-dtk">
      {/* ─── Hero with background image ─── */}
      <section className="relative flex h-[50vh] min-h-[380px] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/contact-service.webp"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/30 via-[#101B91]/15 to-[#08A9E8]/20" />
          <HeroDecor />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="max-w-3xl text-primary-foreground">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Contact
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">Parlons de votre projet</h1>
            <p className="mt-4 text-lg text-primary-foreground/90 md:text-xl">
              Un seul formulaire pour tous vos besoins : devis, inscription, sous-traitance,
              renseignements. Notre équipe vous répond rapidement.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Quick contact cards ─── */}
      <section className="relative z-20 -mt-16 px-4 md:px-6">
        <div className="container mx-auto">
          <Reveal direction="up" delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {settings?.email && (
                <ContactCard icon="FaEnvelope" label="Email" value={settings.email} href={`mailto:${settings.email}`} />
              )}
              {settings?.phone && (
                <ContactCard icon="FaPhone" label="Téléphone" value={settings.phone} href={`tel:${settings.phone}`} />
              )}
              {wa && (
                <ContactCard icon="FaWhatsapp" label="WhatsApp" value="Discuter maintenant" href={wa} external accentColor="#25D366" />
              )}
              {(settings?.addressCity || settings?.addressLine) && (
                <ContactCard icon="FaMapMarkerAlt" label="Adresse" value={`${settings?.addressLine || ''} ${settings?.addressCity || ''}`.trim()} />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Form + Map ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Form */}
            <Reveal direction="right" className="rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Envoyez votre demande</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choisissez le type de demande, remplissez le formulaire et nous vous répondons rapidement.
                </p>
              </div>
              <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
                <RequestForm
                  services={serviceOptions}
                  formations={formationOptions}
                  whatsappLink={wa}
                />
              </Suspense>
            </Reveal>

            {/* Map + info sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <Reveal direction="left" className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
                <div className="relative h-72 w-full">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=-13.7%2C9.45%2C-13.55%2C9.6&layer=mapnik&marker=9.5%2C-13.6`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    title="Carte — DTK Corporation SARL"
                  />
                  <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-card/90 px-3 py-2 text-sm shadow-lg backdrop-blur">
                    <p className="font-semibold">{settings?.legalName || 'DTK Corporation SARL'}</p>
                    {settings?.addressCity && <p className="text-xs text-muted-foreground">{settings.addressCity}, Guinée</p>}
                  </div>
                </div>
              </Reveal>

              {/* Coordinates */}
              <Reveal direction="left" delay={0.1} className="rounded-3xl border border-border bg-card p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Icon name="FaMapMarkerAlt" size={16} className="text-accent" />
                  Coordonnées
                </h3>
                <ul className="space-y-3 text-sm">
                  {settings?.email && (
                    <li className="flex items-start gap-3">
                      <Icon name="FaEnvelope" size={16} className="mt-0.5 shrink-0 text-accent" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                        <a href={`mailto:${settings.email}`} className="text-accent hover:underline break-all">{settings.email}</a>
                      </div>
                    </li>
                  )}
                  {settings?.phone && (
                    <li className="flex items-start gap-3">
                      <Icon name="FaPhone" size={16} className="mt-0.5 shrink-0 text-accent" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Téléphone</p>
                        <a href={`tel:${settings.phone}`} className="text-accent hover:underline">{settings.phone}</a>
                      </div>
                    </li>
                  )}
                  {(settings?.addressLine || settings?.addressCity) && (
                    <li className="flex items-start gap-3">
                      <Icon name="FaMapMarkerAlt" size={16} className="mt-0.5 shrink-0 text-accent" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Adresse</p>
                        <p>{settings?.addressLine}{settings?.addressLine && settings?.addressCity ? ', ' : ''}{settings?.addressCity}</p>
                      </div>
                    </li>
                  )}
                  {zones.length > 0 && (
                    <li className="flex items-start gap-3">
                      <Icon name="FaGlobe" size={16} className="mt-0.5 shrink-0 text-accent" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Zones d'intervention</p>
                        <p>{zones.join(', ')}</p>
                      </div>
                    </li>
                  )}
                </ul>
                {!settings?.email && !settings?.phone && !settings?.addressLine && (
                  <p className="text-xs text-muted-foreground italic">
                    Les coordonnées seront affichées ici dès qu'elles seront renseignées par l'entreprise.
                  </p>
                )}
                {wa && (
                  <Button asChild className="mt-4 w-full bg-[#25D366] hover:bg-[#1da851] text-white">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      <Icon name="FaWhatsapp" size={18} className="mr-2" />
                      Écrire sur WhatsApp
                    </a>
                  </Button>
                )}
              </Reveal>

              {/* Social */}
              {(settings?.facebookUrl || settings?.linkedinUrl || settings?.instagramUrl) && (
                <Reveal direction="left" delay={0.2} className="rounded-3xl border border-border bg-card p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Icon name="FaShareAlt" size={16} className="text-accent" />
                    Réseaux sociaux
                  </h3>
                  <div className="flex gap-3">
                    {settings?.facebookUrl && (
                      <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white">
                        <Icon name="FaFacebookF" size={18} />
                      </a>
                    )}
                    {settings?.linkedinUrl && (
                      <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white">
                        <Icon name="FaLinkedinIn" size={18} />
                      </a>
                    )}
                    {settings?.instagramUrl && (
                      <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-[#E4405F] hover:bg-gradient-to-br hover:from-[#E4405F] hover:to-[#F77737] hover:text-white">
                        <Icon name="FaInstagram" size={18} />
                      </a>
                    )}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external,
  accentColor,
}: {
  icon: string
  label: string
  value: string
  href?: string
  external?: boolean
  accentColor?: string
}) {
  const inner = (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
        style={{ backgroundColor: accentColor || 'var(--primary)' }}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {inner}
      </a>
    )
  }
  return inner
}
