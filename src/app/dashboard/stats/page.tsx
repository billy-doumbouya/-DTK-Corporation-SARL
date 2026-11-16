import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import { Icon } from '@/lib/icon'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chiffres clés' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'iconKey', label: '', render: (i) => <Icon name={i.iconKey || 'FaChartLine'} size={16} className="text-accent" /> },
  { key: 'value', label: 'Valeur', render: (i) => <span className="font-bold text-primary">{i.value}</span> },
  { key: 'label', label: 'Libellé', render: (i) => <span className="text-muted-foreground">{i.label}</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'label', label: 'Libellé', type: 'text', required: true, placeholder: 'Ex : Projets réalisés' },
  { name: 'value', label: 'Valeur', type: 'text', required: true, placeholder: 'Ex : 100+' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS },
  { name: 'order', label: 'Ordre', type: 'number' },
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
