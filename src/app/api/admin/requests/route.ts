import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

const VALID_STATUSES = ['nouveau', 'en_cours', 'traite', 'archive']

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || undefined
  const status = url.searchParams.get('status') || undefined
  const q = url.searchParams.get('q')?.trim() || undefined
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get('pageSize') || '10')))

  const where = {
    AND: [
      type ? { type } : {},
      status ? { status } : {},
      q
        ? {
            OR: [
              { fullName: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
              { message: { contains: q } },
            ],
          }
        : {},
    ],
  }

  const [total, items] = await Promise.all([
    db.request.count({ where }),
    db.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ total, page, pageSize, items })
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '')
  const status = String(body.status || '')

  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })
  }

  const updated = await db.request.update({ where: { id }, data: { status } }).catch(() => null)
  if (!updated) return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 })

  await db.auditLog.create({
    data: { userId: user.id, action: 'request.update_status', detail: `${id} → ${status}` },
  }).catch(() => {})

  return NextResponse.json({ item: updated })
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })

  await db.request.delete({ where: { id } }).catch(() => null)
  await db.auditLog.create({
    data: { userId: user.id, action: 'request.delete', detail: id },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
