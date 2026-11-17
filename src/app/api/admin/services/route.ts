import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { stringifyArray } from '@/lib/settings'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.service.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))

  const data: any = {
    slug: String(body.slug || '').trim().toLowerCase().replace(/\s+/g, '-'),
    title: String(body.title || '').trim(),
    shortTitle: body.shortTitle ? String(body.shortTitle) : null,
    excerpt: String(body.excerpt || '').trim(),
    description: String(body.description || '').trim(),
    iconKey: String(body.iconKey || 'FaBuilding'),
    coverUrl: body.coverUrl ? String(body.coverUrl) : null,
    coverAlt: body.coverAlt ? String(body.coverAlt) : null,
    order: Number(body.order) || 0,
    isSubcontracting: !!body.isSubcontracting,
    isPublished: body.isPublished !== false,
    zones: String(body.zones || ''),
    features: stringifyArray(
      Array.isArray(body.features)
        ? body.features
        : String(body.features || '').split('\n').map((s: string) => s.trim()).filter(Boolean)
    ),
  }

  if (!data.slug || !data.title || !data.excerpt) {
    return NextResponse.json({ error: 'Slug, titre et résumé sont requis.' }, { status: 400 })
  }

  try {
    const item = await db.service.create({ data })
    revalidateForModel('Service')
    await logAction(user.id, ACTIONS.SERVICE_CREATE, `slug=${item.slug}`)
    return NextResponse.json({ item })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
