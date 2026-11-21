import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Partenaires' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'logoUrl', label: 'Logo', format: 'image', imageFit: 'contain', altKey: 'name' },
  { key: 'name', label: 'Nom', format: 'text-medium' },
  { key: 'websiteUrl', label: 'Site web', format: 'link-muted-xs', fallback: '—' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'name', label: 'Nom du partenaire', type: 'text', required: true, placeholder: 'Ex : Partenaire Guinée SA' },
  { name: 'logoUrl', label: 'URL du logo', type: 'image', placeholder: 'https://… ou /uploads/logo-partenaire.png', altField: 'name' },
  { name: 'websiteUrl', label: 'Site web', type: 'text', placeholder: 'https://…' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
