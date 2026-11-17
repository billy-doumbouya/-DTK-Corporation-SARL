import { db } from '@/lib/db'
import { getSiteSettings, parseStringArray, splitList, whatsappLink } from '@/lib/settings'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const services = await db.service.findMany({ where: { isPublished: true }, select: { slug: true } })
  return services.map((s) => ({ slug: s.slug }))
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

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
        {service.coverUrl ? (
          <Image src={service.coverUrl} alt={service.coverAlt || service.title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary">
            <Icon name={service.iconKey || 'FaBuilding'} size={64} className="text-primary-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/20" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container mx-auto px-4 pb-12 md:px-6">
            <nav className="mb-3 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Link href="/" className="hover:text-accent">Accueil</Link>
              <Icon name="FaChevronRight" size={10} />
              <Link href="/services" className="hover:text-accent">Services</Link>
              <Icon name="FaChevronRight" size={10} />
              <span className="text-accent">{service.shortTitle || service.title}</span>
            </nav>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground backdrop-blur">
                <Icon name={service.iconKey || 'FaBuilding'} size={28} />
              </span>
              <h1 className="text-3xl font-extrabold text-primary-foreground md:text-5xl">{service.title}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main */}
            <div>
              <h2 className="text-2xl font-bold">{service.shortTitle || service.title}</h2>
              <p className="mt-2 text-lg text-muted-foreground">{service.excerpt}</p>
              <div className="prose prose-lg mt-6 max-w-none whitespace-pre-line text-muted-foreground">
                {service.description}
              </div>

              {features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold">Ce que nous proposons</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                        <Icon name="FaCheckCircle" size={16} className="mt-0.5 shrink-0 text-accent" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold">Galerie</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                        <Image src={img.url} alt={img.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products for agro/elevage */}
              {service.products.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold">Produits</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {service.products.map((p) => (
                      <div key={p.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                        {p.imageUrl && (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <Image src={p.imageUrl} alt={p.imageAlt || p.name} fill sizes="64px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold">{p.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formations */}
              {service.formations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold">Formations</h3>
                  <div className="mt-4 space-y-4">
                    {service.formations.map((f) => (
                      <div key={f.id} className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold">{f.title}</h4>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.excerpt}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{f.duration}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Public : {f.audience}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {zones.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Icon name="FaGlobe" size={14} className="text-accent" />
                    Zones d’intervention
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {zones.map((z) => (
                      <span key={z} className="rounded-full bg-muted px-3 py-1 text-xs">{z}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                <h3 className="font-bold">Une demande ?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Devis, inscription, sous-traitance ou renseignement : un seul formulaire.
                </p>
                <Button asChild className="mt-3 w-full">
                  <Link href={`/contact?type=${service.isSubcontracting ? 'sous-traitance' : 'devis'}`}>
                    <Icon name="FaPaperPlane" size={14} className="mr-2" />
                    Faire une demande
                  </Link>
                </Button>
                {wa && (
                  <Button asChild variant="outline" className="mt-2 w-full border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      <Icon name="FaWhatsapp" size={16} className="mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
