import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const content = String(body.content || '').trim()
  if (!content) {
    return NextResponse.json({ error: 'Le contenu est requis.' }, { status: 400 })
  }

  const exists = await db.request.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 })

  const note = await db.requestNote.create({
    data: { requestId: id, content, authorId: user.id },
  })

  return NextResponse.json({ item: note })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const notes = await db.requestNote.findMany({
    where: { requestId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items: notes })
}
