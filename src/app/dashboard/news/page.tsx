import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Actualités' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'coverUrl', label: 'Image', format: 'image', altKey: 'coverAlt' },
  { key: 'title', label: 'Titre', format: 'text-medium-clamp' },
  { key: 'authorName', label: 'Auteur', format: 'text-muted-xs' },
  { key: 'publishedAt', label: 'Date', format: 'date-muted-xs' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : DTK lance un nouveau projet agricole' },
  { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'dtk-lance-nouveau-projet-agricole' },
  { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, placeholder: 'Résumez l’information principale en quelques phrases.' },
  { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Contenu complet de l’article…' },
  { name: 'coverUrl', label: 'URL couverture', type: 'image', placeholder: 'https://… ou /uploads/actualite.jpg', altField: 'coverAlt' },
  { name: 'coverAlt', label: 'Texte alternatif', type: 'text', placeholder: 'Ex : Équipe DTK lors du lancement' },
  { name: 'tags', label: 'Tags (séparés par virgules)', type: 'text', placeholder: 'Ex : agriculture, projet, DTK' },
  { name: 'authorName', label: 'Auteur', type: 'text', placeholder: 'DTK Corporation SARL' },
  { name: 'publishedAt', label: 'Date de publication', type: 'date', help: 'Ex. : 21/11/2026 — choisissez la date et l’heure de publication.' },
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
