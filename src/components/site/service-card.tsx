import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/lib/icon'
import { cn } from '@/lib/utils'

interface ServiceCardData {
  slug: string
  title: string
  shortTitle: string | null
  excerpt: string
  iconKey: string
  coverUrl: string | null
  coverAlt: string | null
  zones: string
}

export function ServiceCard({ service }: { service: ServiceCardData; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-accent/40"
    >
      {/* Image with overlay */}
      <div className="relative h-52 overflow-hidden">
        {service.coverUrl ? (
          <Image
            src={service.coverUrl}
            alt={service.coverAlt || service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Icon name={service.iconKey || 'FaBuilding'} size={56} className="text-primary/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />

        {/* Floating icon badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg backdrop-blur transition-transform group-hover:scale-110 group-hover:rotate-3">
            <Icon name={service.iconKey || 'FaBuilding'} size={18} />
          </span>
          <span className="text-sm font-semibold text-primary-foreground drop-shadow">{service.shortTitle || service.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-accent">
          {service.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{service.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
          <span>Découvrir</span>
          <Icon name="FaArrowRight" size={14} className="transition-transform group-hover:translate-x-2" />
        </div>
      </div>

      {/* Top accent line that appears on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

export function ServiceCardCompact({ service }: { service: ServiceCardData }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary transition-all group-hover:from-accent group-hover:to-accent group-hover:text-accent-foreground group-hover:scale-110">
        <Icon name={service.iconKey || 'FaBuilding'} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug transition-colors group-hover:text-accent">
          {service.shortTitle || service.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.excerpt}</p>
      </div>
      <Icon name="FaArrowRight" size={12} className="mt-2 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  )
}
