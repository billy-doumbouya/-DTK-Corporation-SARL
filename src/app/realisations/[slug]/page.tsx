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
  try {
    const items = await db.realisation.findMany({
      where: { isPublished: true },
      select: { slug: true },
    })
    return items.map((item) => ({ slug: item.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await db.realisation.findFirst({
    where: { slug, isPublished: true, publishedAt: { lte: new Date() } },
  })
  if (!item) return { title: 'Réalisation introuvable' }

  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/realisations/${slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      images: item.coverUrl ? [{ url: item.coverUrl, alt: item.coverAlt || item.title }] : [],
    },
  }
}

export default async function RealisationDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await db.realisation.findFirst({
    where: { slug, isPublished: true, publishedAt: { lte: new Date() } },
    include: { images: { orderBy: { order: 'asc' } } },
  })

  if (!item) notFound()

  const paragraphs = item.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const publishedDate = item.publishedAt.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative isolate min-h-[620px] overflow-hidden bg-[#08133d] text-white sm:min-h-[690px]">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.coverAlt || item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(8,169,232,0.34),transparent_38%),linear-gradient(125deg,#08133d,#101b91_58%,#07527c)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071139]/70 via-[#071139]/40 to-[#071139]/70" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-20 h-[34rem] w-[34rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-40 h-[25rem] w-[25rem] rounded-full border border-white/10"
        />

        <div className="public-hero-copy container relative z-10 mx-auto flex min-h-[620px] flex-col justify-between px-4 pb-14 pt-10 sm:min-h-[690px] sm:px-6 sm:pb-16 lg:px-8">
          <nav
            aria-label="Fil d’Ariane"
            className="flex flex-wrap items-center gap-2 text-sm text-white/65"
          >
            <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
            <Icon name="FaChevronRight" size={10} aria-hidden="true" />
            <Link href="/realisations" className="transition-colors hover:text-white">Réalisations</Link>
            <Icon name="FaChevronRight" size={10} aria-hidden="true" />
            <span aria-current="page" className="max-w-[14rem] truncate text-white/90">
              {item.title}
            </span>
          </nav>

          <div className="max-w-5xl py-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                Réalisation · {item.category}
              </span>
            </div>
            <h1 className="max-w-5xl text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              {item.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              {item.excerpt}
            </p>
            <Link
              href="#le-projet"
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:border-accent/70 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Explorer le projet
              <Icon name="FaArrowDown" size={13} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-end justify-between gap-6 border-t border-white/20 pt-5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              DTK Corporation SARL
            </span>
            <span className="flex items-center gap-2 text-sm text-white/75">
              <Icon name="FaMapMarkerAlt" size={13} className="text-accent" aria-hidden="true" />
              {item.location || 'Guinée'}
            </span>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_20px_70px_rgba(16,27,145,0.08)] md:grid-cols-3">
            <div className="flex items-start gap-4 border-b border-border/80 p-6 md:border-b-0 md:border-r md:p-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Icon name="FaLayerGroup" size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Domaine
                </p>
                <p className="mt-1 font-semibold text-foreground">{item.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-b border-border/80 p-6 md:border-b-0 md:border-r md:p-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon name="FaMapMarkedAlt" size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Localisation
                </p>
                <p className="mt-1 font-semibold text-foreground">{item.location || 'Non précisée'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 md:p-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Icon name="FaCalendarAlt" size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Publication
                </p>
                <time dateTime={item.publishedAt.toISOString()} className="mt-1 block font-semibold text-foreground">
                  {publishedDate}
                </time>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="le-projet" className="relative overflow-hidden py-20 sm:py-28">
        <div aria-hidden="true" className="bg-ellipse-dtk opacity-60" />
        <div className="container relative z-10 mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-8">
          <aside className="self-start lg:sticky lg:top-32">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent" />
              Le projet
            </p>
            <h2 className="mt-5 max-w-sm text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
              Une initiative ancrée dans son territoire.
            </h2>
            <div className="mt-8 h-px w-full max-w-xs bg-border" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
              Découvrez le contexte et les informations publiés par DTK Corporation.
            </p>
          </aside>

          <article className="min-w-0">
            <p className="border-l-2 border-accent pl-5 text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-9">
              {item.excerpt}
            </p>
            <div className="mt-9 space-y-6 text-base leading-8 text-muted-foreground">
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </section>

      {item.images.length > 0 && (
        <section className="border-y border-border/70 bg-muted/25 py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">En images</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                  Galerie du projet
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.images.length} {item.images.length === 1 ? 'visuel' : 'visuels'}
              </span>
            </div>
            <div className="grid auto-rows-[220px] gap-4 sm:auto-rows-[280px] sm:grid-cols-2 lg:auto-rows-[340px]">
              {item.images.map((image, index) => (
                <figure
                  key={image.id}
                  className={`group relative isolate overflow-hidden rounded-2xl bg-primary/5 ${
                    index === 0 && item.images.length > 2 ? 'sm:row-span-2 sm:row-start-1' : ''
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071139]/45 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
                  <figcaption className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white drop-shadow">
                    {image.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative isolate overflow-hidden bg-[#08133d] py-16 text-white sm:py-20">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-40 h-[30rem] w-[30rem] rounded-full border border-white/10"
        />
        <div className="container relative z-10 mx-auto flex flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              À votre tour
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Vous avez un projet à étudier ?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Présentez votre besoin à l’équipe DTK Corporation via le formulaire de demande.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-full bg-accent px-6 text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] hover:bg-accent/90"
          >
            <Link href="/contact?type=devis">
              Parler de votre projet
              <Icon name="FaArrowRight" size={14} className="ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:text-primary">
          <Link href="/realisations">
            <Icon name="FaArrowLeft" size={14} className="mr-2" aria-hidden="true" />
            Retour aux réalisations
          </Link>
        </Button>
      </div>
    </main>
  )
}
