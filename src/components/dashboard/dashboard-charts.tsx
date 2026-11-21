'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'

export interface MonthlyRequestPoint {
  month: string
  label: string
  total: number
  nouveau: number
  en_cours: number
  traite: number
  archive: number
}

export interface RequestCategoryPoint {
  label: string
  count: number
  color: string
}

const STATUS_SERIES = [
  { key: 'nouveau', label: 'Nouveau', color: '#2196F3' },
  { key: 'en_cours', label: 'En cours', color: '#FF9800' },
  { key: 'traite', label: 'Traité', color: '#4CAF50' },
  { key: 'archive', label: 'Archivé', color: '#9E9E9E' },
] as const

function DarkTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-32 rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-xs text-white shadow-xl">
      <p className="mb-1.5 font-semibold text-white/70">{String(label ?? '')}</p>
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={`${item.dataKey ?? item.name}-${index}`} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {String(item.name ?? item.dataKey ?? 'Demandes')}
            </span>
            <span className="font-bold tabular-nums">{Number(item.value ?? 0).toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-lg border border-[#e7eaf0] bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#1a2332]">{title}</h2>
        <p className="mt-1 text-xs text-[#7b8494]">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export function DashboardCharts({
  monthly,
  categories,
}: {
  monthly: MonthlyRequestPoint[]
  categories: RequestCategoryPoint[]
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Demandes par mois" subtitle="Volume reçu sur les 12 derniers mois">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="requestBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2196F3" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2196F3" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#edf0f4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8992a1', fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8992a1', fontSize: 11 }} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f0f7ff' }} />
              <Bar dataKey="total" name="Demandes" fill="url(#requestBarGradient)" radius={[5, 5, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Répartition par catégorie" subtitle="Demandes selon leur type">
        <div className="flex min-h-[260px] flex-col items-center justify-center">
          <div className="h-[200px] w-full max-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<DarkTooltip />} />
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {categories.map((category) => (
                    <Cell key={category.label} fill={category.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid w-full grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {categories.map((category) => (
              <div key={category.label} className="flex min-w-0 items-center gap-2 text-xs text-[#667085]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="truncate">{category.label}</span>
                <span className="ml-auto font-semibold tabular-nums text-[#1a2332]">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="Évolution des demandes"
        subtitle="Tendance mensuelle ventilée par statut"
        className="xl:col-span-2"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#edf0f4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8992a1', fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8992a1', fontSize: 11 }} />
              <Tooltip content={<DarkTooltip />} />
              {STATUS_SERIES.map((status) => (
                <Line
                  key={status.key}
                  type="monotone"
                  dataKey={status.key}
                  name={status.label}
                  stroke={status.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {STATUS_SERIES.map((status) => (
            <span key={status.key} className="inline-flex items-center gap-2 text-xs text-[#667085]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
              {status.label}
            </span>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
