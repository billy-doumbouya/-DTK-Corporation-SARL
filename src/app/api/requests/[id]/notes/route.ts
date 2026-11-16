import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const content = typeof body.content === 'string' ? body.content.slice(0, 2000).trim() : ''

    if (!content) {
      return NextResponse.json({ error: 'Note vide.' }, { status: 400 })
    }

    const note = await db.requestNote.create({
      data: { requestId: id, content, authorId: user.id },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'request.add_note', detail: `id=${id}` },
    }).catch(() => {})

    return NextResponse.json({ ok: true, note })
  } catch (e: any) {
     
    console.error('[admin/requests/[id]/notes] POST error:', e)
    return NextResponse.json({ error: 'Erreur lors de l’ajout de la note.' }, { status: 500 })
  }
}
