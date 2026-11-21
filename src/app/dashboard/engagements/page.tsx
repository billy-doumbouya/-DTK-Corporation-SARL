import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Engagements QHSSE' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'iconKey', label: '', format: 'icon', fallback: 'FaShieldAlt' },
  { key: 'title', label: 'Titre', format: 'text-medium' },
  { key: 'description', label: 'Description', format: 'text-muted-xs-clamp' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : Zéro accident' },
  { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Décrivez en une phrase l’engagement et sa mise en œuvre.' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS, placeholder: 'Choisir une icône…' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
