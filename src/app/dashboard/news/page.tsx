import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Actualités' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'title', label: 'Titre', render: (i) => <span className="font-medium line-clamp-1">{i.title}</span> },
  { key: 'authorName', label: 'Auteur', render: (i) => <span className="text-muted-foreground text-xs">{i.authorName}</span> },
  { key: 'publishedAt', label: 'Date', render: (i) => <span className="text-muted-foreground text-xs">{new Date(i.publishedAt).toLocaleDateString('fr-FR')}</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true },
  { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Contenu complet de l’article…' },
  { name: 'coverUrl', label: 'URL couverture', type: 'text' },
  { name: 'coverAlt', label: 'Texte alternatif', type: 'text' },
  { name: 'tags', label: 'Tags (séparés par virgules)', type: 'text' },
  { name: 'authorName', label: 'Auteur', type: 'text', placeholder: 'DTK Corporation SARL' },
  { name: 'publishedAt', label: 'Date de publication', type: 'date' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function NewsAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/news"
      columns={columns}
      fields={fields}
      title="Actualités"
      description="Articles publiés sur le site."
    />
  )
}
