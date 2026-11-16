import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

interface Params { params: Promise<{ id: string }> }

const VALID_STATUSES = ['nouveau', 'en_cours', 'traite', 'archive']

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    if (body.status && VALID_STATUSES.includes(body.status)) {
      const updated = await db.request.update({
        where: { id },
        data: { status: body.status },
      })
      await db.auditLog.create({
        data: { userId: user.id, action: 'request.update_status', detail: `id=${id} status=${body.status}` },
      }).catch(() => {})
      revalidateForModel('Request')
      return NextResponse.json({ ok: true, request: updated })
    }

    return NextResponse.json({ error: 'Champ invalide.' }, { status: 400 })
  } catch (e: any) {
     
    console.error('[admin/requests/[id]] PATCH error:', e)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id } = await params
    await db.request.delete({ where: { id } })
    await db.auditLog.create({
      data: { userId: user.id, action: 'request.delete', detail: `id=${id}` },
    }).catch(() => {})
    revalidateForModel('Request')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
     
    console.error('[admin/requests/[id]] DELETE error:', e)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}
