import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {b.href ? (
                <Link href={b.href} className="hover:text-accent">{b.label}</Link>
              ) : (
                <span>{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <Icon name="FaChevronRight" size={10} />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  accent?: 'blue' | 'orange' | 'green' | 'gray' | 'navy'
  trend?: { label: string; direction: 'up' | 'down' | 'neutral' }
  context?: string
  className?: string
}

const STAT_ACCENTS = {
  blue: 'border-l-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
  orange: 'border-l-[#FF9800] bg-[#FF9800]/10 text-[#FF9800]',
  green: 'border-l-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]',
  gray: 'border-l-[#9E9E9E] bg-[#9E9E9E]/15 text-[#737373]',
  navy: 'border-l-[#1a2332] bg-[#1a2332]/[0.06] text-[#1a2332]',
} as const

const TREND_COLORS = {
  up: 'text-[#2e9d55]',
  down: 'text-[#e14b4b]',
  neutral: 'text-[#8992a1]',
} as const

export function StatCard({
  label,
  value,
  icon,
  accent = 'blue',
  trend,
  context,
  className,
}: StatCardProps) {
  return (
    <div className={cn('group rounded-lg border border-[#e7eaf0] border-l-4 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md', STAT_ACCENTS[accent].split(' ')[0], className)}>
      <div className="flex min-h-[82px] items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#7b8494]">{label}</p>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums text-[#1a2332]">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', STAT_ACCENTS[accent].split(' ').slice(1).join(' '))}>
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div className="mt-3 min-h-5">
        {trend ? (
          <p className={cn('flex items-center gap-1 text-xs font-semibold', TREND_COLORS[trend.direction])}>
            <span aria-hidden="true">{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '•'}</span>
            {trend.label}
          </p>
        ) : (
          <p className="text-xs text-[#98a1af]">{context || 'Dans la période sélectionnée'}</p>
        )}
      </div>
    </div>
  )
}
