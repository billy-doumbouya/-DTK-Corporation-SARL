import { ResourceManager, type FieldDef, type ColumnDef } from '@/components/dashboard/resource-manager'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQ' }
export const dynamic = 'force-dynamic'

const columns: ColumnDef[] = [
  { key: 'order', label: 'Ordre', render: (i) => <span className="text-muted-foreground">{i.order}</span> },
  { key: 'question', label: 'Question', render: (i) => <span className="font-medium line-clamp-1">{i.question}</span> },
  { key: 'answer', label: 'Réponse', render: (i) => <span className="text-muted-foreground text-xs line-clamp-1">{i.answer}</span> },
  { key: 'isPublished', label: 'Publié', render: (i) => <Badge variant={i.isPublished ? 'default' : 'secondary'}>{i.isPublished ? 'Oui' : 'Non'}</Badge> },
]

const fields: FieldDef[] = [
  { name: 'question', label: 'Question', type: 'text', required: true },
  { name: 'answer', label: 'Réponse', type: 'textarea', required: true },
  { name: 'keywords', label: 'Mots-clés (séparés par virgules)', type: 'text', placeholder: 'devis, prix, formulaire', help: 'Aide le chatbot à retrouver cette réponse.' },
  { name: 'order', label: 'Ordre', type: 'number' },
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
