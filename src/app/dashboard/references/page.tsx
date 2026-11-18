import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Références sous-traitance' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'clientName', label: 'Donneur d.ordre', render: (i) => <span className="font-medium">{i.clientName}</span> },
  { key: 'domain', label: 'Domaine', render: (i) => <Badge variant="outline">{i.domain}</Badge> },
  { key: 'missionType', label: 'Type', render: (i) => <span className="text-muted-foreground text-xs">{i.missionType}</span> },
  { key: 'duration', label: 'Durée', render: (i) => <span className="text-muted-foreground text-xs">{i.duration}</span> },
  { key: 'status', label: 'Statut', render: (i) => (
    <Badge variant={i.status === 'ongoing' ? 'default' : 'secondary'}>{i.status === 'ongoing' ? 'En cours' : 'Livré'}</Badge>
  )},
]

const fields: FieldDef[] = [
  { name: 'clientName', label: 'Donneur d.ordre', type: 'text', required: true, placeholder: 'Ex: Donneur d.ordre confidentiel' },
  { name: 'missionType', label: 'Type de mission', type: 'select', options: [
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
  ]},
  { name: 'scope', label: 'Description de la mission', type: 'textarea', placeholder: 'Description courte de la mission confiée' },
  { name: 'duration', label: 'Durée', type: 'text', placeholder: 'Ex: 6 mois, En cours' },
  { name: 'location', label: 'Lieu', type: 'text', placeholder: 'Ex: Conakry' },
  { name: 'status', label: 'Statut', type: 'select', options: [
    { value: 'delivered', label: 'Livré' },
    { value: 'ongoing', label: 'En cours' },
  ]},
  { name: 'testimonial', label: 'Témoignage client (optionnel)', type: 'textarea', placeholder: 'Témoignage du donneur d.ordre' },
  { name: 'order', label: 'Ordre', type: 'number' },
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
