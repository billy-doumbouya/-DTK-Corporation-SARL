import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Réalisations' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'title', label: 'Titre', render: (i) => <span className="font-medium">{i.title}</span> },
  { key: 'category', label: 'Catégorie', render: (i) => <Badge variant="outline">{i.category || '—'}</Badge> },
  { key: 'location', label: 'Lieu', render: (i) => <span className="text-muted-foreground text-xs">{i.location || '—'}</span> },
  { key: 'publishedAt', label: 'Date', render: (i) => <span className="text-muted-foreground text-xs">{new Date(i.publishedAt).toLocaleDateString('fr-FR')}</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'category', label: 'Catégorie', type: 'text', placeholder: 'Ex : BTP' },
  { name: 'location', label: 'Lieu', type: 'text' },
  { name: 'coverUrl', label: 'URL couverture', type: 'text' },
  { name: 'coverAlt', label: 'Texte alternatif', type: 'text' },
  { name: 'publishedAt', label: 'Date de publication', type: 'date' },
  { name: 'order', label: 'Ordre', type: 'number' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function RealisationsAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/realisations"
      columns={columns}
      fields={fields}
      title="Réalisations"
      description="Portfolio de projets réalisés."
    />
  )
}
