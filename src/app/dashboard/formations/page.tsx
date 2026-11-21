import { db } from '@/lib/db'
import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Formations' }
export const dynamic = 'force-dynamic'

export default async function FormationsAdminPage() {
  const services = await db.service.findMany({ where: { slug: 'formation' }, select: { id: true, title: true } })
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.title }))

  const columns: ColumnDef[] = [
    { key: 'imageUrl', label: 'Image', format: 'image', altKey: 'imageAlt' },
    { key: 'title', label: 'Titre', format: 'text-medium' },
    { key: 'duration', label: 'Durée', format: 'badge', fallback: '—' },
    { key: 'audience', label: 'Public', format: 'text-muted-xs' },
    { key: 'isPublished', label: 'Publié', format: 'published' },
  ]

  const fields: FieldDef[] = [
    { name: 'serviceId', label: 'Service formation', type: 'select', options: serviceOptions, placeholder: 'Choisir une formation…', required: true },
    { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Ex : Formation BTP — Techniques de construction' },
    { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'formation-btp-techniques-construction' },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, placeholder: 'Présentez brièvement les objectifs et le contenu de la formation.' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Détaillez le programme, les modules et les compétences visées.' },
    { name: 'duration', label: 'Durée', type: 'text', placeholder: 'Ex : 2 à 3 mois' },
    { name: 'audience', label: 'Public cible', type: 'text', placeholder: 'Jeunes diplômés et professionnels' },
    { name: 'imageUrl', label: 'URL image', type: 'text', placeholder: 'https://… ou /uploads/formation.jpg' },
    { name: 'imageAlt', label: 'Texte alternatif', type: 'text', placeholder: 'Ex : Participants à une formation BTP' },
    { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
