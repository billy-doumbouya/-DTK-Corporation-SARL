import { db } from '@/lib/db'
import { PageHeader, StatCard } from '@/components/dashboard/page-header'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Accueil' }

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  devis: 'Devis',
  contact: 'Contact',
  formation: 'Formation',
  'sous-traitance': 'Sous-traitance générale',
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

export default async function DashboardHome() {
  const [
    newRequests,
    totalRequests,
    requestsByType,
    totalServices,
    totalProducts,
    totalFormations,
    totalRealisations,
    totalNews,
    totalPartners,
    recentRequests,
  ] = await Promise.all([
    db.request.count({ where: { status: 'nouveau' } }),
    db.request.count(),
    db.request.groupBy({ by: ['type'], _count: true }),
    db.service.count({ where: { isPublished: true } }),
    db.product.count({ where: { isPublished: true } }),
    db.formation.count({ where: { isPublished: true } }),
    db.realisation.count({ where: { isPublished: true } }),
    db.newsArticle.count({ where: { isPublished: true } }),
    db.partner.count({ where: { isPublished: true } }),
    db.request.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  const typeCountMap = new Map(requestsByType.map((r) => [r.type, r._count]))

  return (
    <div>
      <PageHeader
        title="Bonjour !"
        description="Vue d’ensemble de l’activité du site DTK Corporation."
      />

      {/* Top counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Nouvelles demandes" value={newRequests} icon="FaFileAlt" />
        <StatCard label="Demandes totales" value={totalRequests} icon="FaChartBar" />
        <StatCard label="Services publiés" value={totalServices} icon="FaBuilding" />
        <StatCard label="Actualités publiées" value={totalNews} icon="FaNewspaper" />
      </div>

      {/* Requests by type */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Demandes par type</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/requests">Voir tout</Link>
            </Button>
          </div>
          <ul className="space-y-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <li key={key} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span>{label}</span>
                <span className="font-semibold">{typeCountMap.get(key) || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content counts */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Contenu publié</h2>
          <div className="grid grid-cols-2 gap-3">
            <ContentCount label="Services" value={totalServices} href="/dashboard/services" icon="FaBuilding" />
            <ContentCount label="Produits" value={totalProducts} href="/dashboard/products" icon="FaTag" />
            <ContentCount label="Formations" value={totalFormations} href="/dashboard/formations" icon="FaGraduationCap" />
            <ContentCount label="Réalisations" value={totalRealisations} href="/dashboard/realisations" icon="FaImages" />
            <ContentCount label="Actualités" value={totalNews} href="/dashboard/news" icon="FaNewspaper" />
            <ContentCount label="Partenaires" value={totalPartners} href="/dashboard/partners" icon="FaHandshake" />
          </div>
        </div>
      </div>

      {/* Recent requests */}
      <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-bold">Dernières demandes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/requests">Tout voir</Link>
          </Button>
        </div>
        {recentRequests.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucune demande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Type</th>
                  <th className="px-5 py-3 text-left font-medium">Nom</th>
                  <th className="px-5 py-3 text-left font-medium">Statut</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{TYPE_LABELS[r.type] || r.type}</Badge>
                    </td>
                    <td className="px-5 py-3 font-medium">{r.fullName}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/requests/${r.id}`}>
                          <Icon name="FaEye" size={14} className="mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentCount({ label, value, href, icon }: { label: string; value: number; href: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:border-accent/40 hover:bg-accent/5">
      <Icon name={icon} size={18} className="text-accent shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </Link>
  )
}
