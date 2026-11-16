import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

const TYPE_LABELS: Record<string, string> = {
  devis: 'Devis',
  contact: 'Contact',
  formation: 'Formation',
  'sous-traitance': 'Sous-traitance',
  renseignements: 'Renseignements',
}

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  archive: 'Archivé',
}

function csvEscape(value: string): string {
  if (!value) return ''
  if (/[",;\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const requests = await db.request.findMany({
    orderBy: { createdAt: 'desc' },
    include: { notes: true },
  })

  const headers = ['Date', 'Type', 'Statut', 'Nom', 'Téléphone', 'Email', 'Message', 'Données supplémentaires', 'Notes']
  const rows = requests.map((r) => {
    let extra = ''
    try {
      const obj = JSON.parse(r.extraData || '{}')
      extra = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(' | ')
    } catch {}
    const notes = r.notes.map((n) => n.content).join(' | ')
    return [
      new Date(r.createdAt).toLocaleString('fr-FR'),
      TYPE_LABELS[r.type] || r.type,
      STATUS_LABELS[r.status] || r.status,
      r.fullName,
      r.phone,
      r.email,
      r.message,
      extra,
      notes,
    ].map(csvEscape).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  return new NextResponse('\ufeff' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demandes-dtk-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
