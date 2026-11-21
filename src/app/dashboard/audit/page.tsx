import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { Icon } from '@/lib/icon'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Journal d’audit' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const ACTION_LABELS: Record<string, string> = {
  login_success: 'Connexion réussie',
  login_failed: 'Connexion échouée',
  logout: 'Déconnexion',
  password_change: 'Changement de mot de passe',
  'request.update_status': 'Statut demande modifié',
  'request.delete': 'Demande supprimée',
  'request.add_note': 'Note ajoutée',
  'service.create': 'Service créé',
  'service.update': 'Service modifié',
  'service.delete': 'Service supprimé',
  'product.create': 'Produit créé',
  'product.update': 'Produit modifié',
  'product.delete': 'Produit supprimé',
  'formation.create': 'Formation créée',
  'formation.update': 'Formation modifiée',
  'formation.delete': 'Formation supprimée',
  'realisation.create': 'Réalisation créée',
  'realisation.update': 'Réalisation modifiée',
  'realisation.delete': 'Réalisation supprimée',
  'news.create': 'Article créé',
  'news.update': 'Article modifié',
  'news.delete': 'Article supprimé',
  'slide.create': 'Slide créé',
  'slide.update': 'Slide modifié',
  'slide.delete': 'Slide supprimé',
  'partner.create': 'Partenaire créé',
  'partner.update': 'Partenaire modifié',
  'partner.delete': 'Partenaire supprimé',
  'engagement.create': 'Engagement créé',
  'engagement.update': 'Engagement modifié',
  'engagement.delete': 'Engagement supprimé',
  'stat.create': 'Statistique créée',
  'stat.update': 'Statistique modifiée',
  'stat.delete': 'Statistique supprimée',
  'faq.create': 'FAQ créée',
  'faq.update': 'FAQ modifiée',
  'faq.delete': 'FAQ supprimée',
  'settings.update': 'Paramètres modifiés',
  'subcontracting.update': 'Page sous-traitance modifiée',
  'chatbot.config.create': 'Modèle chatbot ajouté',
  'chatbot.config.update': 'Modèle chatbot modifié',
  'chatbot.config.delete': 'Modèle chatbot supprimé',
  'chatbot.reindex': 'Base RAG réindexée',
  'media.upload': 'Média téléversé',
  'media.delete': 'Média supprimé',
}

const ACTION_BADGES: Record<string, string> = {
  create: 'bg-green-100 text-green-700 border-green-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  login: 'bg-purple-100 text-purple-700 border-purple-200',
  logout: 'bg-gray-100 text-gray-700 border-gray-200',
}

function getBadgeClass(action: string): string {
  if (action.includes('create')) return ACTION_BADGES.create
  if (action.includes('update')) return ACTION_BADGES.update
  if (action.includes('delete')) return ACTION_BADGES.delete
  if (action.includes('login')) return ACTION_BADGES.login
  if (action.includes('logout')) return ACTION_BADGES.logout
  return 'bg-muted text-muted-foreground'
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; q?: string }>
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const action = sp.action
  const q = sp.q

  const where = {
    AND: [
      action ? { action: { contains: action } } : {},
      q
        ? {
            OR: [
              { detail: { contains: q } },
              { action: { contains: q } },
              { ip: { contains: q } },
            ],
          }
        : {},
    ],
  }

  const [total, logs, actionCounts] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 15,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filterUrl = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(sp as any)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    return `/dashboard/audit?${params.toString()}`
  }

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Journal d’audit"
        description={`${total} action(s) enregistrée(s). Toutes les opérations sensibles sont tracées.`}
      />

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Log table */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Filters */}
          <div className="border-b border-border p-4">
            <form action="/dashboard/audit" method="get" className="relative">
              <input
                name="q"
                defaultValue={q || ''}
                placeholder="Rechercher dans le journal…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm"
              />
              <Icon name="FaSearch" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Détail</th>
                  <th className="px-4 py-3 text-left font-medium">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      Aucune entrée trouvée.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        <div>{new Date(log.createdAt).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs">{new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getBadgeClass(log.action)}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {log.detail || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <div className="text-xs font-medium">{log.user.name || log.user.email}</div>
                            <div className="text-xs text-muted-foreground">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {log.ip || '—'}
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
                Page {page} / {totalPages} — {total} entrée(s)
              </p>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link href={`/dashboard/audit?${new URLSearchParams({ ...(sp as any), page: String(page - 1) }).toString()}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                    <Icon name="FaChevronLeft" size={14} />
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/dashboard/audit?${new URLSearchParams({ ...(sp as any), page: String(page + 1) }).toString()}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                    <Icon name="FaChevronRight" size={14} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: action summary */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Icon name="FaChartBar" size={14} className="text-accent" />
              Actions fréquentes
            </h2>
            <ul className="space-y-1.5">
              <li>
                <Link href={filterUrl('action', undefined)} className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-muted">
                  <span>Toutes</span>
                  <span className="font-semibold">{total}</span>
                </Link>
              </li>
              {actionCounts.map((a) => (
                <li key={a.action}>
                  <Link href={filterUrl('action', a.action)} className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-muted">
                    <span className="truncate text-xs">{ACTION_LABELS[a.action] || a.action}</span>
                    <span className="ml-2 shrink-0 font-semibold">{a._count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-accent">
              <Icon name="FaInfoCircle" size={14} />
              <span className="text-sm font-semibold">À propos</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Le journal d’audit enregistre toutes les actions sensibles : connexions,
              modifications de contenu, suppressions, changements de statut, uploads, etc.
              Les entrées sont triées par date (plus récent en premier).
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
