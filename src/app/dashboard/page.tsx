import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { DashboardCharts, type MonthlyRequestPoint, type RequestCategoryPoint } from '@/components/dashboard/dashboard-charts'
import { PageHeader, StatCard } from '@/components/dashboard/page-header'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Accueil' }

export const dynamic = 'force-dynamic'

const TYPE_OPTIONS = [
  { value: 'devis', label: 'Devis', color: '#2196F3' },
  { value: 'contact', label: 'Contact', color: '#4CAF50' },
  { value: 'formation', label: 'Formation', color: '#FF9800' },
  { value: 'sous-traitance', label: 'Sous-traitance', color: '#F44336' },
  { value: 'renseignements', label: 'Renseignements', color: '#9E9E9E' },
] as const

const STATUS_OPTIONS = [
  { value: 'nouveau', label: 'Nouveau', color: '#2196F3', accent: 'blue' },
  { value: 'en_cours', label: 'En cours', color: '#FF9800', accent: 'orange' },
  { value: 'traite', label: 'Traité', color: '#4CAF50', accent: 'green' },
  { value: 'archive', label: 'Archivé', color: '#9E9E9E', accent: 'gray' },
] as const

const STATUS_COLORS: Record<string, string> = {
  nouveau: 'border-[#bbdefb] bg-[#e3f2fd] text-[#1565c0]',
  en_cours: 'border-[#ffe0b2] bg-[#fff3e0] text-[#e65100]',
  traite: 'border-[#c8e6c9] bg-[#e8f5e9] text-[#2e7d32]',
  archive: 'border-[#e0e0e0] bg-[#f5f5f5] text-[#616161]',
}

type SortKey = 'createdAt' | 'type' | 'fullName' | 'email' | 'status'
type SortDirection = 'asc' | 'desc'

interface DashboardSearchParams {
  q?: string
  type?: string
  status?: string
  from?: string
  to?: string
  page?: string
  pageSize?: string
  sort?: string
  direction?: string
}

interface DashboardQueryState {
  q: string
  type: string
  status: string
  from: string
  to: string
  page: number
  pageSize: number
  sort: SortKey
  direction: SortDirection
}

function parseDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function makeSearchWhere(query: string): Prisma.RequestWhereInput {
  if (!query) return {}
  return {
    OR: [
      { fullName: { contains: query } },
      { email: { contains: query } },
      { phone: { contains: query } },
      { message: { contains: query } },
    ],
  }
}

function sortOrder(sort: SortKey, direction: SortDirection): Prisma.RequestOrderByWithRelationInput {
  switch (sort) {
    case 'type':
      return { type: direction }
    case 'fullName':
      return { fullName: direction }
    case 'email':
      return { email: direction }
    case 'status':
      return { status: direction }
    default:
      return { createdAt: direction }
  }
}

function requestTrend(current: number, previous: number) {
  if (current === previous) {
    return { label: 'Stable vs 30 j précédents', direction: 'neutral' as const }
  }
  if (previous === 0) {
    return {
      label: current === 0 ? 'Stable vs 30 j précédents' : 'Nouveau vs 30 j précédents',
      direction: current === 0 ? 'neutral' as const : 'up' as const,
    }
  }
  const percentage = Math.round(((current - previous) / previous) * 100)
  return {
    label: `${percentage > 0 ? '+' : ''}${percentage}% vs 30 j précédents`,
    direction: current > previous ? 'up' as const : 'down' as const,
  }
}

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const params = await searchParams
  const query = (params.q || '').trim().slice(0, 100)
  const filterType = TYPE_OPTIONS.some((option) => option.value === params.type) ? params.type! : ''
  const filterStatus = STATUS_OPTIONS.some((option) => option.value === params.status) ? params.status! : ''
  const sortKeys: SortKey[] = ['createdAt', 'type', 'fullName', 'email', 'status']
  const sort = sortKeys.includes(params.sort as SortKey) ? params.sort as SortKey : 'createdAt'
  const direction: SortDirection = params.direction === 'asc' ? 'asc' : 'desc'
  const requestedPageSize = Number(params.pageSize)
  const pageSize = [10, 25, 50].includes(requestedPageSize) ? requestedPageSize : 10
  const requestedPage = Number.parseInt(params.page || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const today = new Date()
  const parsedTo = parseDate(params.to || undefined)
  const toDate = parsedTo ?? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const fallbackFrom = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth() - 11, 1))
  const parsedFrom = parseDate(params.from || undefined)
  const fromDate = parsedFrom && parsedFrom <= toDate ? parsedFrom : fallbackFrom
  const toExclusive = new Date(toDate.getTime() + 24 * 60 * 60 * 1000)
  const fromValue = dateInputValue(fromDate)
  const toValue = dateInputValue(toDate)

  const searchWhere = makeSearchWhere(query)
  const activityWhere: Prisma.RequestWhereInput = {
    ...searchWhere,
    ...(filterType ? { type: filterType } : {}),
  }
  const periodWhere: Prisma.RequestWhereInput = {
    ...activityWhere,
    createdAt: { gte: fromDate, lt: toExclusive },
  }
  const tableWhere: Prisma.RequestWhereInput = {
    ...periodWhere,
    ...(filterStatus ? { status: filterStatus } : {}),
  }

  const monthStart = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth() - 11, 1))
  const monthEnd = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth() + 1, 1))
  const chartStart = fromDate > monthStart ? fromDate : monthStart
  const chartEnd = toExclusive < monthEnd ? toExclusive : monthEnd
  const chartWhere: Prisma.RequestWhereInput = {
    ...activityWhere,
    createdAt: { gte: chartStart, lt: chartEnd },
    ...(filterStatus ? { status: filterStatus } : {}),
  }

  const now = new Date()
  const currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - 30 * 24 * 60 * 60 * 1000)
  const [
    totalMatching,
    statusGroups,
    categoryGroups,
    monthlyRequests,
    receivedLast30Days,
    receivedPrevious30Days,
    totalServices,
    totalProducts,
    totalFormations,
    totalRealisations,
    totalNews,
    totalPartners,
  ] = await Promise.all([
    db.request.count({ where: tableWhere }),
    db.request.groupBy({ by: ['status'], where: periodWhere, _count: true }),
    db.request.groupBy({ by: ['type'], where: tableWhere, _count: true }),
    db.request.findMany({
      where: chartWhere,
      select: { createdAt: true, status: true },
    }),
    db.request.count({
      where: { ...activityWhere, createdAt: { gte: currentPeriodStart, lt: now } },
    }),
    db.request.count({
      where: { ...activityWhere, createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } },
    }),
    db.service.count({ where: { isPublished: true } }),
    db.product.count({ where: { isPublished: true } }),
    db.formation.count({ where: { isPublished: true } }),
    db.realisation.count({ where: { isPublished: true } }),
    db.newsArticle.count({ where: { isPublished: true } }),
    db.partner.count({ where: { isPublished: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize))
  const currentPage = Math.min(page, totalPages)
  const requests = await db.request.findMany({
    where: tableWhere,
    orderBy: sortOrder(sort, direction),
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  })

  const statusCountMap = new Map(statusGroups.map((item) => [item.status, item._count]))
  const categoryCountMap = new Map(categoryGroups.map((item) => [item.type, item._count]))
  const categoryData: RequestCategoryPoint[] = TYPE_OPTIONS.map((option) => ({
    label: option.label,
    count: categoryCountMap.get(option.value) || 0,
    color: option.color,
  }))
  const monthlyCountMap = new Map<string, Record<string, number>>()
  for (const row of monthlyRequests) {
    const monthKey = row.createdAt.toISOString().slice(0, 7)
    const statusCounts = monthlyCountMap.get(monthKey) || {}
    statusCounts.total = (statusCounts.total || 0) + 1
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
    monthlyCountMap.set(monthKey, statusCounts)
  }
  const monthlyData: MonthlyRequestPoint[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth() - 11 + index, 1))
    const month = date.toISOString().slice(0, 7)
    const statusCounts = monthlyCountMap.get(month) || {}
    const nouveau = statusCounts.nouveau || 0
    const en_cours = statusCounts.en_cours || 0
    const traite = statusCounts.traite || 0
    const archive = statusCounts.archive || 0
    return {
      month,
      label: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date),
      total: statusCounts.total || 0,
      nouveau,
      en_cours,
      traite,
      archive,
    }
  })
  const trend = requestTrend(receivedLast30Days, receivedPrevious30Days)
  const queryState: DashboardQueryState = {
    q: query,
    type: filterType,
    status: filterStatus,
    from: fromValue,
    to: toValue,
    page: currentPage,
    pageSize,
    sort,
    direction,
  }

  function dashboardHref(overrides: Partial<DashboardQueryState> = {}) {
    const state = { ...queryState, ...overrides }
    const search = new URLSearchParams()
    if (state.q) search.set('q', state.q)
    if (state.type) search.set('type', state.type)
    if (state.status) search.set('status', state.status)
    search.set('from', state.from)
    search.set('to', state.to)
    search.set('page', String(state.page))
    search.set('pageSize', String(state.pageSize))
    search.set('sort', state.sort)
    search.set('direction', state.direction)
    return `/dashboard?${search.toString()}`
  }

  const trendDirection = trend.direction
  const formattedCount = (value: number) => value.toLocaleString('fr-FR')

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Vue d’ensemble"
        description="Suivez les demandes, leur évolution et le contenu du site."
      />

      <form action="/dashboard" method="get" className="mb-6 rounded-lg border border-[#e7eaf0] bg-white p-4 shadow-sm">
        <input type="hidden" name="pageSize" value={pageSize} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="direction" value={direction} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(2,minmax(150px,0.8fr))_repeat(2,minmax(140px,0.7fr))_auto_auto] xl:items-end">
          <label className="relative block">
            <span className="sr-only">Rechercher une demande</span>
            <Icon name="FaSearch" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a1af]" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Nom, email, téléphone…"
              className="h-10 rounded-lg border-[#e0e4eb] bg-white pl-9 text-sm"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filtrer par type</span>
            <select name="type" defaultValue={filterType} className="h-10 w-full rounded-lg border border-[#e0e4eb] bg-white px-3 text-sm text-[#344054] outline-none transition focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/15">
              <option value="">Tous les types</option>
              {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filtrer par statut</span>
            <select name="status" defaultValue={filterStatus} className="h-10 w-full rounded-lg border border-[#e0e4eb] bg-white px-3 text-sm text-[#344054] outline-none transition focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/15">
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#7b8494]">Du</span>
            <Input name="from" type="date" defaultValue={fromValue} className="h-10 rounded-lg border-[#e0e4eb] bg-white text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#7b8494]">Au</span>
            <Input name="to" type="date" defaultValue={toValue} className="h-10 rounded-lg border-[#e0e4eb] bg-white text-sm" />
          </label>

          <Button type="submit" className="h-10 rounded-lg bg-[#1a2332] px-4 text-white hover:bg-[#26364c]">
            <Icon name="FaFilter" size={13} className="mr-2" />
            Filtrer
          </Button>

          <Button asChild variant="ghost" className="h-10 rounded-lg text-[#667085] hover:bg-[#f0f7ff] hover:text-[#1a2332]">
            <Link href="/dashboard">Effacer</Link>
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Reçues (30 jours)"
          value={receivedLast30Days}
          icon="FaChartBar"
          accent="navy"
          trend={{ label: trend.label, direction: trendDirection }}
        />
        <StatCard label="Nouvelles" value={statusCountMap.get('nouveau') || 0} icon="FaFileAlt" accent="blue" />
        <StatCard label="En cours" value={statusCountMap.get('en_cours') || 0} icon="FaClock" accent="orange" />
        <StatCard label="Traitées" value={statusCountMap.get('traite') || 0} icon="FaCheckCircle" accent="green" />
        <StatCard label="Archivées" value={statusCountMap.get('archive') || 0} icon="FaFolder" accent="gray" />
      </div>

      <DashboardCharts monthly={monthlyData} categories={categoryData} />

      <section className="mt-6 overflow-hidden rounded-lg border border-[#e7eaf0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f4] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a2332]">Demandes reçues</h2>
            <p className="mt-1 text-xs text-[#7b8494]">{formattedCount(totalMatching)} résultat(s) pour la période sélectionnée</p>
          </div>
          <Button asChild variant="outline" size="sm" className="h-9 rounded-lg border-[#e0e4eb]">
            <a href="/api/requests/export" download>
              <Icon name="FaDownload" size={13} className="mr-2" />
              Exporter
            </a>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[#f8f9fc] text-[10px] uppercase tracking-[0.08em] text-[#7b8494]">
              <tr>
                {([
                  { key: 'createdAt', label: 'Date' },
                  { key: 'type', label: 'Catégorie' },
                  { key: 'fullName', label: 'Nom' },
                  { key: 'email', label: 'Contact' },
                  { key: 'status', label: 'Statut' },
                ] as const).map((column) => {
                  const activeSort = sort === column.key
                  const nextDirection = activeSort && direction === 'asc' ? 'desc' : 'asc'
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={activeSort ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="px-5 py-3 text-left font-semibold"
                    >
                      <Link
                        href={dashboardHref({ sort: column.key, direction: nextDirection, page: 1 })}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-[#2196F3]"
                      >
                        {column.label}
                        <Icon
                          name={activeSort ? (direction === 'asc' ? 'FaChevronUp' : 'FaChevronDown') : 'FaChevronDown'}
                          size={10}
                          className={activeSort ? 'text-[#2196F3]' : 'opacity-35'}
                        />
                      </Link>
                    </th>
                  )
                })}
                <th scope="col" className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f4]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-[#7b8494]">
                    Aucune demande ne correspond à ces filtres.
                  </td>
                </tr>
              ) : requests.map((request) => (
                <tr key={request.id} className="transition-colors hover:bg-[#f0f7ff]">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#667085]">
                    {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    <span className="ml-2 text-[#98a1af]">
                      {new Date(request.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="border-[#e0e4eb] bg-[#f8f9fc] font-medium text-[#475467]">
                      {TYPE_OPTIONS.find((option) => option.value === request.type)?.label || request.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[#1a2332]">{request.fullName}</td>
                  <td className="px-5 py-3.5">
                    <a href={`mailto:${request.email}`} className="text-xs text-[#667085] transition-colors hover:text-[#2196F3]">{request.email}</a>
                    <p className="mt-0.5 text-xs text-[#98a1af]">{request.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[request.status] || STATUS_COLORS.archive}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_OPTIONS.find((option) => option.value === request.status)?.label || request.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#667085] hover:bg-white hover:text-[#2196F3]" aria-label={`Voir la demande de ${request.fullName}`}>
                      <Link href={`/dashboard/requests/${request.id}`}>
                        <Icon name="FaEye" size={15} />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edf0f4] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#7b8494]">
            {totalMatching === 0 ? 'Aucun résultat' : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalMatching)} sur ${formattedCount(totalMatching)}`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <form action="/dashboard" method="get" className="flex items-center gap-2">
              <input type="hidden" name="q" value={query} />
              <input type="hidden" name="type" value={filterType} />
              <input type="hidden" name="status" value={filterStatus} />
              <input type="hidden" name="from" value={fromValue} />
              <input type="hidden" name="to" value={toValue} />
              <input type="hidden" name="sort" value={sort} />
              <input type="hidden" name="direction" value={direction} />
              <label htmlFor="pageSize" className="text-xs text-[#7b8494]">Par page</label>
              <select id="pageSize" name="pageSize" defaultValue={pageSize} className="h-8 rounded-md border border-[#e0e4eb] bg-white px-2 text-xs text-[#344054]">
                {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              <Button type="submit" variant="outline" size="sm" className="h-8 rounded-md border-[#e0e4eb] px-2.5 text-xs">Appliquer</Button>
            </form>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="icon" className={`h-8 w-8 rounded-md border-[#e0e4eb] ${currentPage <= 1 ? 'pointer-events-none opacity-40' : ''}`}>
                <Link
                  href={dashboardHref({ page: Math.max(1, currentPage - 1) })}
                  aria-label="Page précédente"
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                >
                  <Icon name="FaChevronLeft" size={12} />
                </Link>
              </Button>
              <span className="min-w-16 text-center text-xs text-[#667085]">{currentPage} / {totalPages}</span>
              <Button asChild variant="outline" size="icon" className={`h-8 w-8 rounded-md border-[#e0e4eb] ${currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''}`}>
                <Link
                  href={dashboardHref({ page: Math.min(totalPages, currentPage + 1) })}
                  aria-label="Page suivante"
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                >
                  <Icon name="FaChevronRight" size={12} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1a2332]">Contenu publié</h2>
          <Link href="/dashboard/services" className="text-xs font-semibold text-[#2196F3] hover:underline">Gérer le contenu</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <ContentCount label="Services" value={totalServices} href="/dashboard/services" icon="FaBuilding" />
          <ContentCount label="Produits" value={totalProducts} href="/dashboard/products" icon="FaTag" />
          <ContentCount label="Formations" value={totalFormations} href="/dashboard/formations" icon="FaGraduationCap" />
          <ContentCount label="Réalisations" value={totalRealisations} href="/dashboard/realisations" icon="FaImages" />
          <ContentCount label="Actualités" value={totalNews} href="/dashboard/news" icon="FaNewspaper" />
          <ContentCount label="Partenaires" value={totalPartners} href="/dashboard/partners" icon="FaHandshake" />
        </div>
      </section>
    </div>
  )
}

function ContentCount({ label, value, href, icon }: { label: string; value: number; href: string; icon: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-lg border border-[#e7eaf0] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bbdefb] hover:shadow-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2196F3]/10 text-[#2196F3] transition-transform group-hover:scale-105">
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-[#7b8494]">{label}</span>
        <span className="mt-1 block text-lg font-bold tabular-nums text-[#1a2332]">{value}</span>
      </span>
    </Link>
  )
}
