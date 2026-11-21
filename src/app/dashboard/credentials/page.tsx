import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
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
  { key: 'iconKey', label: '', format: 'icon', fallback: 'FaShieldAlt' },
  { key: 'label', label: 'Libellé', format: 'text-medium' },
  { key: 'value', label: 'Valeur', format: 'text-muted-xs' },
  { key: 'category', label: 'Catégorie', format: 'mapped-badge', labels: CATEGORY_LABELS },
]

const fields: FieldDef[] = [
  { name: 'label', label: 'Libellé', type: 'text', required: true, placeholder: 'Ex: Assurance RC Professionnelle' },
  { name: 'value', label: 'Valeur', type: 'text', required: true, placeholder: 'Ex: Policy N° XXX' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS, placeholder: 'Choisir une icône…' },
  { name: 'category', label: 'Catégorie', type: 'select', placeholder: 'Choisir une catégorie…', options: [
    { value: 'legal', label: 'Juridique' },
    { value: 'insurance', label: 'Assurance' },
    { value: 'financial', label: 'Financier' },
    { value: 'certification', label: 'Certification' },
  ]},
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
