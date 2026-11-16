import { db } from '@/lib/db'
import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Produits' }
export const dynamic = 'force-dynamic'

export default async function ProductsAdminPage() {
  const services = await db.service.findMany({ orderBy: { order: 'asc' }, select: { id: true, title: true, shortTitle: true } })
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.shortTitle || s.title }))

  const columns: ColumnDef[] = [
    { key: 'name', label: 'Nom', render: (i) => <span className="font-medium">{i.name}</span> },
    { key: 'service', label: 'Service', render: (i) => <span className="text-muted-foreground">{i.service?.shortTitle || i.service?.title || '—'}</span> },
    { key: 'unit', label: 'Unité', render: (i) => <span className="text-muted-foreground">{i.unit || '—'}</span> },
    { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
  ]

  const fields: FieldDef[] = [
    { name: 'serviceId', label: 'Service associé', type: 'select', options: serviceOptions, required: true },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'unit', label: 'Unité / Conditionnement', type: 'text', placeholder: 'Ex : sac 25kg' },
    { name: 'imageUrl', label: 'URL image', type: 'text' },
    { name: 'imageAlt', label: 'Texte alternatif', type: 'text' },
    { name: 'order', label: 'Ordre', type: 'number' },
    { name: 'isPublished', label: 'Publié', type: 'switch' },
  ]

  return (
    <ResourceManager
      apiPath="/api/admin/products"
      columns={columns}
      fields={fields}
      title="Produits"
      description="Produits agro-alimentaires et de l’élevage."
    />
  )
}
