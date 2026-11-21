import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Réalisations' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'coverUrl', label: 'Image', format: 'image', altKey: 'coverAlt' },
  { key: 'title', label: 'Titre', format: 'text-medium' },
  { key: 'category', label: 'Catégorie', format: 'badge', fallback: '—' },
  { key: 'location', label: 'Lieu', format: 'text-muted-xs', fallback: '—' },
  { key: 'publishedAt', label: 'Date', format: 'date-muted-xs' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : Construction d’un centre de santé' },
  { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'construction-centre-sante' },
  { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, placeholder: 'Résumez le projet et son résultat en une ou deux phrases.' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Décrivez le contexte, les travaux réalisés et les résultats.' },
  { name: 'category', label: 'Catégorie', type: 'text', placeholder: 'Ex : BTP' },
  { name: 'location', label: 'Lieu', type: 'text', placeholder: 'Ex : Conakry, Guinée' },
  { name: 'coverUrl', label: 'URL couverture', type: 'text', placeholder: 'https://… ou /uploads/projet.jpg' },
  { name: 'coverAlt', label: 'Texte alternatif', type: 'text', placeholder: 'Ex : Bâtiment achevé vu de face' },
  { name: 'publishedAt', label: 'Date de publication', type: 'date', help: 'Ex. : 21/11/2026 — choisissez la date et l’heure de publication.' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
