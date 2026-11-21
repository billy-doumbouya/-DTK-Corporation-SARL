import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/site/reveal'
import { RichBackground, DotGrid, FloatingShapes, PathLines } from '@/components/site/decor-background'
import { whatsappLink, getSiteSettings } from '@/lib/settings'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({ where: { isPublished: true }, select: { slug: true } })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { service: { select: { title: true, shortTitle: true, slug: true } } },
  })
  if (!product) return { title: 'Produit introuvable' }
  return {
    title: product.name,
    description: product.excerpt,
    alternates: { canonical: `/produits/${slug}` },
    openGraph: {
      title: product.name,
      description: product.excerpt,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.imageAlt || product.name }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { service: { select: { title: true, shortTitle: true, slug: true } } },
  })

  if (!product || !product.isPublished) notFound()

  const settings = await getSiteSettings()
  const wa = whatsappLink(settings?.whatsapp)

  // Related products from same service
  const related = await db.product.findMany({
    where: { isPublished: true, serviceId: product.serviceId, id: { not: product.id } },
    take: 3,
    orderBy: { order: 'asc' },
  })

  return (
    <>
      {/* Breadcrumb + Hero */}
      <section className="relative overflow-hidden bg-primary py-12 text-primary-foreground md:py-16">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#08A9E8] opacity-[0.15] blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white opacity-[0.05] blur-[90px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <nav className="mb-4 flex items-center gap-2 text-sm text-primary-foreground/70">
            <Link href="/" className="hover:text-accent">Accueil</Link>
            <Icon name="FaChevronRight" size={10} />
            <Link href="/produits" className="hover:text-accent">Produits</Link>
            <Icon name="FaChevronRight" size={10} />
            <span className="text-accent line-clamp-1">{product.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold md:text-5xl">{product.name}</h1>
            {product.service && (
              <Link href={`/services/${product.service.slug}`}>
                <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">
                  {product.service.shortTitle || product.service.title}
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Product content — image alongside text */}
      <section className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Image column */}
            <Reveal direction="right">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
                {product.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt || product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Decorative overlay badge */}
                    {product.unit && (
                      <div className="absolute bottom-4 left-4 rounded-xl bg-primary/90 px-3 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
                        {product.unit}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <Icon name="FaTag" size={64} className="text-primary/30" />
                  </div>
                )}
              </div>
            </Reveal>

            {/* Text column */}
            <Reveal direction="left" delay={0.1}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="mt-3 text-lg text-muted-foreground">{product.excerpt}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Icon name="FaFileAlt" size={16} className="text-accent" />
                    Description
                  </h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
                </div>

                {/* Product info grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {product.unit && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Conditionnement</p>
                      <p className="mt-1 font-semibold">{product.unit}</p>
                    </div>
                  )}
                  {product.service && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Service associé</p>
                      <Link href={`/services/${product.service.slug}`} className="mt-1 flex items-center gap-1 font-semibold text-accent hover:underline">
                        {product.service.shortTitle || product.service.title}
                        <Icon name="FaArrowRight" size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={`/contact?type=devis`}>
                      <Icon name="FaPaperPlane" size={16} className="mr-2" />
                      Demander un devis
                    </Link>
                  </Button>
                  {wa && (
                    <Button asChild size="lg" variant="outline" className="border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10">
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        <Icon name="FaWhatsapp" size={18} className="mr-2" />
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

      {/* Related products */}
      {related.length > 0 && (
        <section className="relative overflow-hidden bg-muted/30 py-16 md:py-20">
          <DotGrid className="opacity-50" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Reveal direction="up">
              <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Produits associés</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp, i) => (
                <Reveal key={rp.id} direction="up" delay={i * 0.1}>
                  <Link
                    href={`/produits/${rp.slug}`}
                    className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      {rp.imageUrl ? (
                        <Image src={rp.imageUrl} alt={rp.imageAlt || rp.name} fill sizes="80px" className="object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <Icon name="FaTag" size={24} className="text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">{rp.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
