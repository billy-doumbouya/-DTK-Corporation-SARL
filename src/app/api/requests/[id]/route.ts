import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { db as dbClient } from '@/lib/db'

export const runtime = 'nodejs'

interface Params { params: Promise<{ id: string }> }

const VALID_STATUSES = ['nouveau', 'en_cours', 'traite', 'archive']

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  if (body.status && VALID_STATUSES.includes(body.status)) {
    const updated = await db.request.update({
      where: { id },
      data: { status: body.status },
    })
    await dbClient.auditLog.create({
      data: { userId: user.id, action: 'request.update_status', detail: `id=${id} status=${body.status}` },
    }).catch(() => {})
    revalidateForModel('Request')
    return NextResponse.json({ ok: true, request: updated })
  }

  return NextResponse.json({ error: 'Champ invalide.' }, { status: 400 })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await db.request.delete({ where: { id } })
  await dbClient.auditLog.create({
    data: { userId: user.id, action: 'request.delete', detail: `id=${id}` },
  }).catch(() => {})
  revalidateForModel('Request')
  return NextResponse.json({ ok: true })
}
