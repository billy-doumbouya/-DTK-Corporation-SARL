import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DotGrid, FloatingShapes } from './decor-background'
import { Reveal } from './reveal'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  variant?: 'default' | 'illustrated'
}

/**
 * Professional empty state with decorative background, large icon,
 * and optional CTA. Gives the "wow" effect even when content is empty.
 */
export function EmptyState({
  icon = 'FaInfoCircle',
  title,
  description,
  actionLabel,
  actionHref,
  variant = 'illustrated',
}: EmptyStateProps) {
  return (
    <Reveal direction="scale" className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-gradient-to-br from-muted/30 to-background p-12 text-center md:p-20">
      {variant === 'illustrated' && (
        <>
          <DotGrid className="opacity-50" />
          <FloatingShapes />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-md">
        {/* Large icon with decorative ring */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-accent/10" />
          <div className="absolute inset-2 rounded-full bg-accent/15" />
          <div className="absolute inset-4 rounded-full bg-accent/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name={icon} size={36} className="text-accent" />
          </div>
          {/* Decorative orbiting dots */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent/40" />
            <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/30" />
          </div>
        </div>
        <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
        {description && (
          <p className="mt-3 text-sm text-muted-foreground md:text-base">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Button asChild className="mt-6">
            <Link href={actionHref}>
              <Icon name="FaArrowRight" size={14} className="mr-2" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </div>
    </Reveal>
  )
}
