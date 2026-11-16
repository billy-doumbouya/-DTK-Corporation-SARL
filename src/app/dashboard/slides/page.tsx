import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Slider accueil' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'order', label: 'Ordre', render: (i) => <span className="text-muted-foreground">{i.order}</span> },
  { key: 'title', label: 'Titre', render: (i) => <span className="font-medium line-clamp-1">{i.title}</span> },
  { key: 'buttonText', label: 'Bouton', render: (i) => <Badge variant="outline">{i.buttonText}</Badge> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'subtitle', label: 'Sous-titre', type: 'textarea', required: true },
  { name: 'buttonText', label: 'Texte du bouton', type: 'text', placeholder: 'En savoir plus' },
  { name: 'buttonHref', label: 'Lien du bouton', type: 'text', placeholder: '/services' },
  { name: 'imageUrl', label: 'URL image (plein écran)', type: 'text', required: true },
  { name: 'imageAlt', label: 'Texte alternatif', type: 'text', required: true },
  { name: 'order', label: 'Ordre', type: 'number' },
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
