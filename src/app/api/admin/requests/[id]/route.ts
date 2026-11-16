import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

const VALID_STATUSES = ['nouveau', 'en_cours', 'traite', 'archive']

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const item = await db.request.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: 'desc' } }, attachments: true },
  })
  if (!item) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const data: Record<string, unknown> = {}
  if (typeof body.status === 'string' && VALID_STATUSES.includes(body.status)) {
    data.status = body.status
  }
  if (typeof body.fullName === 'string') data.fullName = body.fullName
  if (typeof body.phone === 'string') data.phone = body.phone
  if (typeof body.email === 'string') data.email = body.email

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Rien à mettre à jour.' }, { status: 400 })
  }

  const item = await db.request.update({ where: { id }, data }).catch(() => null)
  if (!item) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  await db.auditLog.create({
    data: { userId: user.id, action: 'request.update', detail: `${id} ${Object.keys(data).join(',')}` },
  }).catch(() => {})

  return NextResponse.json({ item })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await db.request.delete({ where: { id } }).catch(() => null)
  await db.auditLog.create({
    data: { userId: user.id, action: 'request.delete', detail: id },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
