import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chiffres clés' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'iconKey', label: '', format: 'icon', fallback: 'FaChartLine' },
  { key: 'value', label: 'Valeur', format: 'text-primary-bold' },
  { key: 'label', label: 'Libellé', format: 'text-muted' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'label', label: 'Libellé', type: 'text', required: true, placeholder: 'Ex : Projets réalisés' },
  { name: 'value', label: 'Valeur', type: 'text', required: true, placeholder: 'Ex : 100+' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS, placeholder: 'Choisir une icône…' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function StatsAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/stats"
      columns={columns}
      fields={fields}
      title="Chiffres clés"
      description="Statistiques affichées sur la page d’accueil (uniquement si publiées). N’inventez aucun chiffre — à valider avec le client."
    />
  )
}
