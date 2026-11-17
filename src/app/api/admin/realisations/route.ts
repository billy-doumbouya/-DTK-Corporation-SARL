import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.realisation.findMany({ orderBy: { publishedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const data: any = {
    title: String(body.title || '').trim(),
    slug: String(body.slug || '').trim().toLowerCase().replace(/\s+/g, '-'),
    excerpt: String(body.excerpt || '').trim(),
    description: String(body.description || '').trim(),
    category: String(body.category || 'BTP'),
    location: body.location ? String(body.location) : null,
    coverUrl: body.coverUrl ? String(body.coverUrl) : null,
    coverAlt: body.coverAlt ? String(body.coverAlt) : null,
    order: Number(body.order) || 0,
    isPublished: body.isPublished !== false,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
  }
  if (!data.title || !data.slug) {
    return NextResponse.json({ error: 'Titre et slug requis.' }, { status: 400 })
  }
  try {
    const item = await db.realisation.create({ data })
    revalidateForModel('Realisation')
    await logAction(user.id, ACTIONS.REALISATION_CREATE, `slug=${item.slug}`)
    return NextResponse.json({ item })
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur.' }, { status: 500 })
  }
}
