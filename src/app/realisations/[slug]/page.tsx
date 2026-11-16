import { db } from '@/lib/db'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const items = await db.realisation.findMany({ where: { isPublished: true }, select: { slug: true } })
  return items.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await db.realisation.findUnique({ where: { slug } })
  if (!item) return { title: 'Réalisation introuvable' }
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/realisations/${slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      images: item.coverUrl ? [{ url: item.coverUrl }] : [],
    },
  }
}

export default async function RealisationDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await db.realisation.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: 'asc' } } },
  })

  if (!item || !item.isPublished || item.publishedAt > new Date()) notFound()

  return (
    <>
      <section className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        {item.coverUrl ? (
          <Image src={item.coverUrl} alt={item.coverAlt || item.title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary">
            <Icon name="FaImages" size={64} className="text-primary-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/20" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container mx-auto px-4 pb-12 md:px-6">
            <nav className="mb-3 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Link href="/" className="hover:text-accent">Accueil</Link>
              <Icon name="FaChevronRight" size={10} />
              <Link href="/realisations" className="hover:text-accent">Réalisations</Link>
              <Icon name="FaChevronRight" size={10} />
              <span className="text-accent">{item.title}</span>
            </nav>
            {item.category && (
              <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{item.category}</span>
            )}
            <h1 className="text-3xl font-extrabold text-primary-foreground md:text-5xl">{item.title}</h1>
          </div>
        </div>
      </section>

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg text-muted-foreground">{item.excerpt}</p>
            {item.location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="FaMapMarkerAlt" size={14} className="text-accent" />
                {item.location}
              </p>
            )}
            <div className="mt-8 whitespace-pre-line text-muted-foreground">{item.description}</div>

            {item.images.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold">Galerie</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {item.images.map((img) => (
                    <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image src={img.url} alt={img.alt} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 border-t pt-6">
              <Button asChild variant="outline">
                <Link href="/realisations">
                  <Icon name="FaArrowLeft" size={14} className="mr-2" />
                  Toutes les réalisations
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
