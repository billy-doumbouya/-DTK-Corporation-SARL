import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/lib/icon'
import { parseStringArray } from '@/lib/settings'
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

export function ServiceCard({ service, index = 0 }: { service: ServiceCardData; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/40"
    >
      <div className="relative h-48 overflow-hidden">
        {service.coverUrl ? (
          <Image
            src={service.coverUrl}
            alt={service.coverAlt || service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10">
            <Icon name={service.iconKey || 'FaBuilding'} size={48} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-primary-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/90 backdrop-blur">
            <Icon name={service.iconKey || 'FaBuilding'} size={16} />
          </span>
          <span className="text-sm font-semibold">{service.shortTitle || service.title}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors">
          {service.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{service.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
          <span>Découvrir</span>
          <Icon name="FaArrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export function ServiceCardCompact({ service }: { service: ServiceCardData }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/40 hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
        <Icon name={service.iconKey || 'FaBuilding'} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">
          {service.shortTitle || service.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.excerpt}</p>
      </div>
    </Link>
  )
}
