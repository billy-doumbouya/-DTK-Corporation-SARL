import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import { Icon } from '@/lib/icon'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Crédentials sous-traitance' }
export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  legal: 'Juridique',
  insurance: 'Assurance',
  financial: 'Financier',
  certification: 'Certification',
}

const columns: ColumnDef[] = [
  { key: 'iconKey', label: '', render: (i) => <Icon name={i.iconKey || 'FaShieldAlt'} size={16} className="text-accent" /> },
  { key: 'label', label: 'Libellé', render: (i) => <span className="font-medium">{i.label}</span> },
  { key: 'value', label: 'Valeur', render: (i) => <span className="text-muted-foreground text-xs">{i.value}</span> },
  { key: 'category', label: 'Catégorie', render: (i) => <Badge variant="outline">{CATEGORY_LABELS[i.category] || i.category}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'label', label: 'Libellé', type: 'text', required: true, placeholder: 'Ex: Assurance RC Professionnelle' },
  { name: 'value', label: 'Valeur', type: 'text', required: true, placeholder: 'Ex: Policy N° XXX' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS },
  { name: 'category', label: 'Catégorie', type: 'select', options: [
    { value: 'legal', label: 'Juridique' },
    { value: 'insurance', label: 'Assurance' },
    { value: 'financial', label: 'Financier' },
    { value: 'certification', label: 'Certification' },
  ]},
  { name: 'order', label: 'Ordre', type: 'number' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function CredentialsAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/credentials"
      columns={columns}
      fields={fields}
      title="Crédentials sous-traitance"
      description="Certifications, assurances, informations juridiques et financières affichées sur la page sous-traitance."
    />
  )
}
