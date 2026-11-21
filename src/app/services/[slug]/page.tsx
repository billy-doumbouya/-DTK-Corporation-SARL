import { db } from '@/lib/db'
import { getSiteSettings, parseStringArray, splitList, whatsappLink } from '@/lib/settings'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes, PathLines, WaveDivider, HeroDecor } from '@/components/site/decor-background'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const services = await db.service.findMany({ where: { isPublished: true }, select: { slug: true } })
    return services.map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await db.service.findUnique({ where: { slug } })
  if (!service) return { title: 'Service introuvable' }
  return {
    title: service.title,
    description: service.excerpt,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: service.title,
      description: service.excerpt,
      images: service.coverUrl ? [{ url: service.coverUrl, alt: service.coverAlt || service.title }] : [],
    },
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await db.service.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      products: { where: { isPublished: true }, orderBy: { order: 'asc' } },
      formations: { where: { isPublished: true }, orderBy: { order: 'asc' } },
    },
  })

  if (!service || !service.isPublished) notFound()

  const settings = await getSiteSettings()
  const wa = whatsappLink(settings?.whatsapp)
  const features = parseStringArray(service.features)
  const zones = splitList(service.zones)
  const gallery = service.images.length > 0 ? service.images : []

  // Process steps specific to each service type
  const processSteps = [
    { icon: 'FaFileAlt', title: '1. Analyse', desc: 'Nous étudions votre besoin et définissons le périmètre précis de l\'intervention.' },
    { icon: 'FaCog', title: '2. Planification', desc: 'Nous établissons un planning clair avec les ressources et délais convenus.' },
    { icon: 'FaTools', title: '3. Exécution', desc: 'Nos équipes interviennent selon les standards QHSSE de DTK Corporation.' },
    { icon: 'FaCheckCircle', title: '4. Livraison', desc: 'Contrôle qualité, livraison conforme et suivi post-intervention.' },
  ]

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[55vh] overflow-hidden">
        <div className="absolute inset-0">
          {service.coverUrl ? (
            <Image src={service.coverUrl} alt={service.coverAlt || service.title} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary">
              <Icon name={service.iconKey || 'FaBuilding'} size={64} className="text-primary-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/70 via-[#101B91]/70 to-[#08A9E8]/70" />
        </div>
        <div className="relative z-10 flex min-h-[55vh] items-end pb-16">
          <div className="public-hero-copy container mx-auto px-4 md:px-6">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/70" aria-label="Fil d'Ariane">
              <Link href="/" className="hover:text-accent">Accueil</Link>
              <Icon name="FaChevronRight" size={10} className="text-accent" />
              <Link href="/services" className="hover:text-accent">Services</Link>
              <Icon name="FaChevronRight" size={10} className="text-accent" />
              <span className="text-accent">{service.shortTitle || service.title}</span>
            </nav>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg backdrop-blur">
                <Icon name={service.iconKey || 'FaBuilding'} size={28} />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold text-white md:text-5xl">{service.title}</h1>
                {zones.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {zones.slice(0, 4).map((z) => (
                      <span key={z} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white backdrop-blur">
                        <Icon name="FaMapMarkerAlt" size={8} />
                        {z}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <WaveDivider color="var(--background)" />
      </section>

      {/* ─── Overview: excerpt + description ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main content (2/3) */}
            <Reveal direction="right" className="lg:col-span-2">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                <span className="h-px w-6 bg-accent/60" />
                {service.shortTitle || service.title}
              </p>
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">{service.excerpt}</h2>
              <div className="mt-6 whitespace-pre-line text-muted-foreground md:text-lg leading-relaxed">
                {service.description}
              </div>
            </Reveal>

            {/* Sidebar (1/3): zones + CTA */}
            <Reveal direction="left" delay={0.1}>
              <div className="sticky top-28 space-y-4">
                {/* Zones card */}
                {zones.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <Icon name="FaGlobe" size={14} className="text-accent" />
                      Zones d'intervention
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {zones.map((z) => (
                        <span key={z} className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">{z}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* CTA card */}
                <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-5 shadow-sm">
                  <h3 className="font-bold">Une demande ?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Devis, inscription, sous-traitance ou renseignement.
                  </p>
                  <Button asChild className="mt-3 w-full rounded-full">
                    <Link href={`/contact?type=devis`}>
                      <Icon name="FaPaperPlane" size={14} className="mr-2" />
                      Faire une demande
                    </Link>
                  </Button>
                  {wa && (
                    <Button asChild variant="outline" className="mt-2 w-full rounded-full border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10">
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        <Icon name="FaWhatsapp" size={16} className="mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Features / Capabilities ─── */}
      {features.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-50" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Reveal direction="up" className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
                <span className="h-px w-6 bg-accent/40" />
                Nos capacités
                <span className="h-px w-6 bg-accent/40" />
              </p>
              <h2 className="text-2xl font-bold md:text-4xl">Ce que nous proposons</h2>
            </Reveal>
            <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
              {features.map((f, i) => (
                <RevealItem key={i}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                    <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-accent/8 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110">
                        <Icon name="FaCheckCircle" size={18} />
                      </span>
                      <p className="text-sm font-medium leading-relaxed">{f}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Gallery ─── */}
      {gallery.length > 0 && (
        <section className="relative overflow-hidden section-padding">
          <RichBackground />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Reveal direction="up" className="mb-8">
              <h2 className="text-2xl font-bold md:text-3xl">Galerie</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {gallery.map((img) => (
                <Reveal key={img.id} direction="scale" delay={0.05}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm">
                    <Image src={img.url} alt={img.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Products (for agro/elevage) ─── */}
      {service.products.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 section-padding">
          <DotGrid className="opacity-40" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Reveal direction="up" className="mb-8">
              <h2 className="text-2xl font-bold md:text-3xl">Nos produits</h2>
              <p className="mt-1 text-muted-foreground">Découvrez nos produits liés à ce service.</p>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.products.map((p, i) => (
                <Reveal key={p.id} direction="up" delay={i * 0.08}>
                  <Link href={`/produits/${p.slug}`} className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/40">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.imageAlt || p.name} fill sizes="80px" className="object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name="FaTag" size={24} className="text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-accent transition-colors">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                      {p.unit && <p className="mt-1 text-xs text-muted-foreground">{p.unit}</p>}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Formations (for formation service) ─── */}
      {service.formations.length > 0 && (
        <section className="relative overflow-hidden section-padding">
          <RichBackground />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Reveal direction="up" className="mb-8">
              <h2 className="text-2xl font-bold md:text-3xl">Nos formations</h2>
              <p className="mt-1 text-muted-foreground">Programmes de formation liés à ce service.</p>
            </Reveal>
            <RevealGroup className="grid gap-6 md:grid-cols-2" stagger={0.1}>
              {service.formations.map((f) => (
                <RevealItem key={f.id}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold group-hover:text-accent transition-colors">{f.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.excerpt}</p>
                      </div>
                      <Badge className="shrink-0 bg-accent/10 text-accent">{f.duration}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="FaUsers" size={12} className="text-accent" />
                      {f.audience}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="mt-3">
                      <Link href="/contact?type=formation">
                        <Icon name="FaPaperPlane" size={12} className="mr-1" />
                        S'inscrire
                      </Link>
                    </Button>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Process steps ─── */}
      <section className="relative overflow-hidden bg-muted/30 section-padding">
        <PathLines />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-6 bg-accent/40" />
              Notre méthode
              <span className="h-px w-6 bg-accent/40" />
            </p>
            <h2 className="text-2xl font-bold md:text-4xl">Un processus rigoureux</h2>
          </Reveal>
          <RevealGroup className="grid gap-6 md:grid-cols-4" stagger={0.1}>
            {processSteps.map((step, i) => (
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

      {/* ─── QHSSE reminder ─── */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <HeroDecor />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up" className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
              <Icon name="FaShieldAlt" size={24} />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Engagement QHSSE</h2>
            <p className="mt-3 text-primary-foreground/85">
              Zéro accident · Zéro dommage pour l'environnement · Zéro compromis sur la qualité.
              Chaque intervention respecte notre politique QHSSE stricte.
            </p>
            <Button asChild variant="secondary" className="mt-5 rounded-full bg-white text-primary hover:bg-white/90">
              <Link href="/a-propos">
                <Icon name="FaShieldAlt" size={14} className="mr-2" />
                En savoir plus
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="scale">
            <div className="mx-auto max-w-2xl rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-8 text-center shadow-lg md:p-12">
              <FloatingShapes />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold md:text-3xl">Une demande pour ce service ?</h2>
                <p className="mt-2 text-muted-foreground">
                  Obtenez un devis, une inscription ou un renseignement en un seul formulaire.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href={`/contact?type=devis`}>
                      <Icon name="FaPaperPlane" size={16} className="mr-2" />
                      Demander un devis
                    </Link>
                  </Button>
                  {wa && (
                    <Button asChild size="lg" variant="outline" className="rounded-full border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10">
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        <Icon name="FaWhatsapp" size={18} className="mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
