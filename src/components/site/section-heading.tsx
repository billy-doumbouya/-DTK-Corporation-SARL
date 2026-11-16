import { Icon } from '@/lib/icon'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  gradient?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  gradient = false,
}: SectionHeadingProps) {
  return (
    <Reveal direction="up" className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
          {align === 'center' && <span className="h-px w-8 bg-accent/40" />}
          {eyebrow}
          {align === 'center' && <span className="h-px w-8 bg-accent/40" />}
        </p>
      )}
      <h2 className={cn('text-2xl font-bold leading-tight md:text-3xl lg:text-4xl', gradient && 'text-gradient-dtk')}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-muted-foreground md:text-lg">{description}</p>
      )}
    </Reveal>
  )
}
