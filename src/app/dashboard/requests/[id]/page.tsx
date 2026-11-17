import { db } from '@/lib/db'
import { PageHeader } from '@/components/dashboard/page-header'
import { RequestDetailActions } from '@/components/dashboard/request-detail-actions'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Détail demande' }
export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  devis: 'Demande de devis',
  contact: 'Contact',
  formation: 'Inscription à une formation',
  'sous-traitance': 'Sous-traitance générale',
  renseignements: 'Renseignements',
}

const FIELD_LABELS: Record<string, string> = {
  activity: 'Activité concernée',
  needDescription: 'Description du besoin',
  location: 'Lieu',
  desiredDelay: 'Délai souhaité',
  subject: 'Sujet',
  formationChoice: 'Formation choisie',
  levelOrProfession: 'Niveau / profession',
  city: 'Ville',
  companyName: 'Entreprise',
  domain: 'Domaine',
  workDescription: 'Description du travail',
  delay: 'Délai',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const request = await db.request.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      attachments: true,
    },
  })

  if (!request) notFound()

  let extra: Record<string, string> = {}
  try {
    extra = JSON.parse(request.extraData || '{}')
  } catch {
    extra = {}
  }

  return (
    <div>
      <PageHeader
        title={`Demande — ${request.fullName}`}
        description={`${TYPE_LABELS[request.type] || request.type} • Reçue le ${new Date(request.createdAt).toLocaleString('fr-FR')}`}
        breadcrumbs={[
          { label: 'Demandes', href: '/dashboard/requests' },
          { label: request.fullName },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/requests">
              <Icon name="FaArrowLeft" size={14} className="mr-2" />
              Retour
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main info */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-bold">Coordonnées</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nom complet</dt>
                <dd className="font-medium">{request.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Téléphone / WhatsApp</dt>
                <dd className="font-medium">
                  <a href={`tel:${request.phone}`} className="text-accent hover:underline">{request.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd className="font-medium">
                  <a href={`mailto:${request.email}`} className="text-accent hover:underline break-all">{request.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">IP</dt>
                <dd className="text-sm text-muted-foreground">{request.ip || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Message */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-bold">Message</h2>
            <p className="whitespace-pre-line text-sm">{request.message}</p>
          </div>

          {/* Extra fields */}
          {Object.keys(extra).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-bold">Détails spécifiques</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                {Object.entries(extra).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{FIELD_LABELS[k] || k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-bold">Pièces jointes</h2>
              <ul className="space-y-2">
                {request.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                      <Icon name={a.mimeType.startsWith('image/') ? 'FaImage' : 'FaFilePdf'} size={14} />
                      {a.filename}
                      <span className="text-xs text-muted-foreground">({Math.round(a.size / 1024)} Ko)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <RequestDetailActions
            requestId={request.id}
            currentStatus={request.status}
            notes={request.notes.map((n) => ({
              id: n.id,
              content: n.content,
              createdAt: n.createdAt.toISOString(),
              authorId: n.authorId,
            }))}
          />
        </aside>
      </div>
    </div>
  )
}
