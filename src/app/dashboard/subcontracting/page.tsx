import { PageHeader } from '@/components/dashboard/page-header'
import { SubcontractingForm } from '@/components/dashboard/subcontracting-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sous-traitance' }
export const dynamic = 'force-dynamic'

export default function SubcontractingAdminPage() {
  return (
    <div>
      <PageHeader title="Page Sous-traitance" description="Contenu de la page dédiée à la sous-traitance." />
      <SubcontractingForm />
    </div>
  )
}
