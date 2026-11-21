import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Références sous-traitance' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'clientName', label: 'Donneur d.ordre', format: 'text-medium' },
  { key: 'domain', label: 'Domaine', format: 'badge' },
  { key: 'missionType', label: 'Type', format: 'text-muted-xs' },
  { key: 'duration', label: 'Durée', format: 'text-muted-xs' },
  {
    key: 'status',
    label: 'Statut',
    format: 'mapped-badge',
    labels: { ongoing: 'En cours', delivered: 'Livré' },
    variants: { ongoing: 'default', delivered: 'secondary' },
  },
]

const fields: FieldDef[] = [
  { name: 'clientName', label: 'Donneur d.ordre', type: 'text', required: true, placeholder: 'Ex: Donneur d.ordre confidentiel' },
  { name: 'missionType', label: 'Type de mission', type: 'select', placeholder: 'Choisir un type de mission…', options: [
    { value: 'Forfait', label: 'Forfait' },
    { value: 'Régie', label: 'Régie' },
    { value: 'Mixed', label: 'Mixed' },
  ]},
  { name: 'domain', label: 'Domaine', type: 'select', options: [
    { value: 'BTP', label: 'BTP' },
    { value: 'Agro-alimentaire', label: 'Agro-alimentaire' },
    { value: 'Formation', label: 'Formation' },
    { value: 'Élevage', label: 'Élevage' },
    { value: 'Froid', label: 'Froid / Climatisation' },
  ], placeholder: 'Choisir un domaine…' },
  { name: 'scope', label: 'Description de la mission', type: 'textarea', placeholder: 'Description courte de la mission confiée' },
  { name: 'duration', label: 'Durée', type: 'text', placeholder: 'Ex: 6 mois, En cours' },
  { name: 'location', label: 'Lieu', type: 'text', placeholder: 'Ex: Conakry' },
  { name: 'status', label: 'Statut', type: 'select', placeholder: 'Choisir un statut…', options: [
    { value: 'delivered', label: 'Livré' },
    { value: 'ongoing', label: 'En cours' },
  ]},
  { name: 'testimonial', label: 'Témoignage client (optionnel)', type: 'textarea', placeholder: 'Témoignage du donneur d.ordre' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function ReferencesAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/references"
      columns={columns}
      fields={fields}
      title="Références sous-traitance"
      description="Missions de sous-traitance réalisées ou en cours. Utilisez « Donneur d.ordre confidentiel » pour préserver l.anonymat."
    />
  )
}
