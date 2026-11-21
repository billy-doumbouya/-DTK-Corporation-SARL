import { db } from '@/lib/db'
import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Produits' }
export const dynamic = 'force-dynamic'

export default async function ProductsAdminPage() {
  const services = await db.service.findMany({ orderBy: { order: 'asc' }, select: { id: true, title: true, shortTitle: true } })
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.shortTitle || s.title }))

  const columns: ColumnDef[] = [
    { key: 'imageUrl', label: 'Image', format: 'image', altKey: 'imageAlt' },
    { key: 'name', label: 'Nom', format: 'text-medium' },
    { key: 'service', label: 'Service', format: 'service-title', fallback: '—' },
    { key: 'unit', label: 'Unité', format: 'text-muted', fallback: '—' },
    { key: 'isPublished', label: 'Publié', format: 'published' },
  ]

  const fields: FieldDef[] = [
    { name: 'serviceId', label: 'Service associé', type: 'select', options: serviceOptions, placeholder: 'Choisir un service…', required: true },
    { name: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'Ex : Riz local étuvé' },
    { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'riz-local-etuve' },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, placeholder: 'Présentez le produit en quelques mots.' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Décrivez les caractéristiques et avantages du produit.' },
    { name: 'unit', label: 'Unité / Conditionnement', type: 'text', placeholder: 'Ex : sac 25kg' },
    { name: 'imageUrl', label: 'URL image', type: 'text', placeholder: 'https://… ou /uploads/produit.jpg' },
    { name: 'imageAlt', label: 'Texte alternatif', type: 'text', placeholder: 'Ex : Sac de riz local DTK' },
    { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
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
