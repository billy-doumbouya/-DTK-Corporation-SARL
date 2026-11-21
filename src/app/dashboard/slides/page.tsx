import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Slider accueil' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'imageUrl', label: 'Image', format: 'image', altKey: 'imageAlt' },
  { key: 'order', label: 'Ordre', format: 'text-muted' },
  { key: 'title', label: 'Titre', format: 'text-medium-clamp' },
  { key: 'buttonText', label: 'Bouton', format: 'badge' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : Construisons ensemble votre avenir' },
  { name: 'subtitle', label: 'Sous-titre', type: 'textarea', required: true, placeholder: 'Présentez brièvement l’offre ou le message principal.' },
  { name: 'buttonText', label: 'Texte du bouton', type: 'text', placeholder: 'En savoir plus' },
  { name: 'buttonHref', label: 'Lien du bouton', type: 'text', placeholder: '/services' },
  { name: 'imageUrl', label: 'URL image (plein écran)', type: 'text', required: true, placeholder: 'https://… ou /uploads/banniere.jpg' },
  { name: 'imageAlt', label: 'Texte alternatif', type: 'text', required: true, placeholder: 'Ex : Chantier de construction réalisé par DTK' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function SlidesAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/slides"
      columns={columns}
      fields={fields}
      title="Slider d’accueil"
      description="Diapositives du carrousel de la page d’accueil."
    />
  )
}
