import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { ICON_OPTIONS } from '@/components/dashboard/icon-options'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'coverUrl', label: 'Image', format: 'image', altKey: 'coverAlt' },
  { key: 'order', label: 'Ordre', format: 'text-muted' },
  { key: 'iconKey', label: '', format: 'icon-tile', fallback: 'FaBuilding' },
  { key: 'title', label: 'Titre', format: 'text-medium' },
  { key: 'slug', label: 'Slug', format: 'code' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : BTP — Bâtiment et Travaux Publics' },
  { name: 'shortTitle', label: 'Titre court', type: 'text', placeholder: 'Ex : BTP' },
  { name: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: 'btp', help: 'Utilisé dans l’URL. Minuscules, tirets.' },
  { name: 'iconKey', label: 'Icône', type: 'select', options: ICON_OPTIONS, placeholder: 'Choisir une icône…' },
  { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, placeholder: 'Court résumé pour les cartes…' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description longue…' },
  { name: 'coverUrl', label: 'URL image de couverture', type: 'text', placeholder: 'https://… ou /uploads/…' },
  { name: 'coverAlt', label: 'Texte alternatif image', type: 'text', placeholder: 'Ex : Équipe DTK sur un chantier' },
  { name: 'zones', label: 'Zones d’intervention', type: 'text', placeholder: 'Conakry, Kankan, Siguiri, Dinguiraye' },
  { name: 'features', label: 'Points forts (un par ligne)', type: 'textarea', placeholder: 'Construction neuve\nRénovation\n…' },
  { name: 'order', label: 'Ordre d’affichage', type: 'number', placeholder: 'Ex : 1' },
  { name: 'isSubcontracting', label: 'Service de sous-traitance ?', type: 'switch' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function ServicesAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/services"
      columns={columns}
      fields={fields}
      title="Services"
      description="Gérez les six domaines d’intervention affichés sur le site."
    />
  )
}
