import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQ' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'order', label: 'Ordre', format: 'text-muted' },
  { key: 'question', label: 'Question', format: 'text-medium-clamp' },
  { key: 'answer', label: 'Réponse', format: 'text-muted-xs-clamp' },
  { key: 'isPublished', label: 'Publié', format: 'published' },
]

const fields: FieldDef[] = [
  { name: 'question', label: 'Question', type: 'text', required: true, placeholder: 'Ex : Comment demander un devis ?' },
  { name: 'answer', label: 'Réponse', type: 'textarea', required: true, placeholder: 'Expliquez les étapes ou informations utiles au visiteur.' },
  { name: 'keywords', label: 'Mots-clés (séparés par virgules)', type: 'text', placeholder: 'devis, prix, formulaire', help: 'Aide le chatbot à retrouver cette réponse.' },
  { name: 'order', label: 'Ordre', type: 'number', placeholder: 'Ex : 1' },
  { name: 'isPublished', label: 'Publié', type: 'switch' },
]

export default function FaqAdminPage() {
  return (
    <ResourceManager
      apiPath="/api/admin/faq"
      columns={columns}
      fields={fields}
      title="FAQ"
      description="Questions fréquentes utilisées par le chatbot en secours."
    />
  )
}
