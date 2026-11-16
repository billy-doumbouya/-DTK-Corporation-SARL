import { PageHeader } from '@/components/dashboard/page-header'
import { SettingsForm } from '@/components/dashboard/settings-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Paramètres' }
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Paramètres du site" description="Coordonnées, réseaux sociaux, SEO, informations légales et options du chatbot." />
      <SettingsForm />
    </div>
  )
}
