import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'
interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const data: any = {}
  for (const k of ['title','slug','excerpt','content','coverUrl','coverAlt','tags','authorName']) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k])
  }
  if (body.slug !== undefined) data.slug = String(body.slug).trim().toLowerCase().replace(/\s+/g, '-')
  if (body.isPublished !== undefined) data.isPublished = !!body.isPublished
  if (body.publishedAt !== undefined) data.publishedAt = new Date(body.publishedAt)
  try {
    const item = await db.newsArticle.update({ where: { id }, data })
    revalidateForModel('NewsArticle')
    await logAction(user.id, ACTIONS.NEWS_UPDATE, `id=${id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await db.newsArticle.delete({ where: { id } })
  revalidateForModel('NewsArticle')
  await logAction(user.id, ACTIONS.NEWS_DELETE, `id=${id}`)
  return NextResponse.json({ ok: true })
}
