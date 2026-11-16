import { db } from '@/lib/db'
import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Formations' }
export const dynamic = 'force-dynamic'

export default async function FormationsAdminPage() {
  const services = await db.service.findMany({ where: { slug: 'formation' }, select: { id: true, title: true } })
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.title }))

  const columns: ColumnDef[] = [
    { key: 'title', label: 'Titre', render: (i) => <span className="font-medium">{i.title}</span> },
    { key: 'duration', label: 'Durée', render: (i) => <Badge variant="outline">{i.duration || '—'}</Badge> },
    { key: 'audience', label: 'Public', render: (i) => <span className="text-muted-foreground text-xs">{i.audience}</span> },
    { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
  ]

  const fields: FieldDef[] = [
    { name: 'serviceId', label: 'Service formation', type: 'select', options: serviceOptions, required: true },
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'duration', label: 'Durée', type: 'text', placeholder: 'Ex : 2 à 3 mois' },
    { name: 'audience', label: 'Public cible', type: 'text', placeholder: 'Jeunes diplômés et professionnels' },
    { name: 'imageUrl', label: 'URL image', type: 'text' },
    { name: 'imageAlt', label: 'Texte alternatif', type: 'text' },
    { name: 'order', label: 'Ordre', type: 'number' },
    { name: 'isPublished', label: 'Publié', type: 'switch' },
  ]

  return (
    <ResourceManager
      apiPath="/api/admin/formations"
      columns={columns}
      fields={fields}
      title="Formations"
      description="Formations proposées par DTK Corporation."
    />
  )
}
