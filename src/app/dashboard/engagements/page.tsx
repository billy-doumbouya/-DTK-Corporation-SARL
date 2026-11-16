import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import { Icon } from '@/lib/icon'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Engagements QHSSE' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'iconKey', label: '', render: (i) => <Icon name={i.iconKey || 'FaShieldAlt'} size={16} className="text-accent" /> },
  { key: 'title', label: 'Titre', render: (i) => <span className="font-medium">{i.title}</span> },
  { key: 'description', label: 'Description', render: (i) => <span className="text-muted-foreground text-xs line-clamp-1">{i.description}</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : Zéro accident' },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS },
  { name: 'order', label: 'Ordre', type: 'number' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function EngagementsAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/engagements"
      columns={columns}
      fields={fields}
      title="Engagements QHSSE"
      description="Les trois principes non négociables affichés sur la page d’accueil."
    />
  )
}
