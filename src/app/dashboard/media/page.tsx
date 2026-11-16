import { PageHeader } from '@/components/dashboard/page-header'
import { MediaLibrary } from '@/components/dashboard/media-library'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Médiathèque' }
export const dynamic = 'force-dynamic'

export default function MediaPage() {
  return (
    <div>
      <PageHeader title="Médiathèque" description="Téléversez et gérez les images du site." />
      <MediaLibrary />
    </div>
  )
}
