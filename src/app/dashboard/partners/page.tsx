import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Partenaires' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'name', label: 'Nom', render: (i) => <span className="font-medium">{i.name}</span> },
  { key: 'websiteUrl', label: 'Site web', render: (i) => i.websiteUrl ? <a href={i.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-accent text-xs hover:underline">{i.websiteUrl}</a> : <span className="text-muted-foreground text-xs">—</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'name', label: 'Nom du partenaire', type: 'text', required: true },
  { name: 'logoUrl', label: 'URL du logo', type: 'text' },
  { name: 'websiteUrl', label: 'Site web', type: 'text', placeholder: 'https://…' },
  { name: 'order', label: 'Ordre', type: 'number' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function PartnersAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/partners"
      columns={columns}
      fields={fields}
      title="Partenaires"
      description="Logos et liens des partenaires affichés sur le site."
    />
  )
}
