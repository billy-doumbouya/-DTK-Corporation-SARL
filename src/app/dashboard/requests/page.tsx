import { db } from '@/lib/db'
import { PageHeader } from '@/components/dashboard/page-header'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Demandes' }
export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  devis: 'Devis',
  contact: 'Contact',
  formation: 'Formation',
  'sous-traitance': 'Sous-traitance',
  renseignements: 'Renseignements',
}

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  archive: 'Archivé',
}

const STATUS_COLORS: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700 border-blue-200',
  en_cours: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  traite: 'bg-green-100 text-green-700 border-green-200',
  archive: 'bg-gray-100 text-gray-600 border-gray-200',
}

const PAGE_SIZE = 20

export default async function RequestsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; status?: string; q?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const type = sp.type
  const status = sp.status
  const q = sp.q

  const where = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { message: { contains: q } },
          ],
        }
      : {}),
  }

  const [total, requests] = await Promise.all([
    db.request.count({ where }),
    db.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filterUrl = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(sp as any)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    return `/dashboard/requests?${params.toString()}`
  }

  return (
    <div>
      <PageHeader
        title="Demandes"
        description={`${total} demande(s) reçue(s).`}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href="/api/requests/export" download>
              <Icon name="FaDownload" size={14} className="mr-2" />
              Exporter CSV
            </a>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="relative" action="/dashboard/requests" method="get">
          <Input name="q" defaultValue={q || ''} placeholder="Rechercher…" className="w-48 pl-8" />
          <Icon name="FaSearch" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </form>

        <div className="flex flex-wrap gap-1">
          <span className="self-center px-2 text-xs text-muted-foreground">Type :</span>
          <FilterPill active={!type} href={filterUrl('type', undefined)} label="Tous" />
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <FilterPill key={v} active={type === v} href={filterUrl('type', v)} label={l} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="self-center px-2 text-xs text-muted-foreground">Statut :</span>
          <FilterPill active={!status} href={filterUrl('status', undefined)} label="Tous" />
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <FilterPill key={v} active={status === v} href={filterUrl('status', v)} label={l} />
          ))}
        </div>

        {(type || status || q) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/requests">Réinitialiser</Link>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Nom</th>
                <th className="px-4 py-3 text-left font-medium">Contact</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      <div className="text-xs">{new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{TYPE_LABELS[r.type] || r.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{r.phone}</div>
                      <div className="text-xs">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/requests/${r.id}`}>
                          <Icon name="FaEye" size={14} className="mr-1" />
                          Détail
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} / {totalPages} — {total} résultat(s)
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/requests?${new URLSearchParams({ ...(sp as any), page: String(page - 1) }).toString()}`}>
                    <Icon name="FaChevronLeft" size={14} />
                  </Link>
                </Button>
              )}
              {page < totalPages && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/requests?${new URLSearchParams({ ...(sp as any), page: String(page + 1) }).toString()}`}>
                    <Icon name="FaChevronRight" size={14} />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterPill({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/10'}`}
    >
      {label}
    </Link>
  )
}

import { Input } from '@/components/ui/input'
