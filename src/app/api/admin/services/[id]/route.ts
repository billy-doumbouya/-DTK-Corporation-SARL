import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { stringifyArray } from '@/lib/settings'

export const runtime = 'nodejs'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const data: any = {}
  if (body.slug !== undefined) data.slug = String(body.slug).trim().toLowerCase().replace(/\s+/g, '-')
  if (body.title !== undefined) data.title = String(body.title).trim()
  if (body.shortTitle !== undefined) data.shortTitle = body.shortTitle ? String(body.shortTitle) : null
  if (body.excerpt !== undefined) data.excerpt = String(body.excerpt).trim()
  if (body.description !== undefined) data.description = String(body.description).trim()
  if (body.iconKey !== undefined) data.iconKey = String(body.iconKey)
  if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl ? String(body.coverUrl) : null
  if (body.coverAlt !== undefined) data.coverAlt = body.coverAlt ? String(body.coverAlt) : null
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.isSubcontracting !== undefined) data.isSubcontracting = !!body.isSubcontracting
  if (body.isPublished !== undefined) data.isPublished = !!body.isPublished
  if (body.zones !== undefined) data.zones = String(body.zones)
  if (body.features !== undefined) {
    data.features = stringifyArray(
      Array.isArray(body.features)
        ? body.features
        : String(body.features).split('\n').map((s: string) => s.trim()).filter(Boolean)
    )
  }

  try {
    const item = await db.service.update({ where: { id }, data })
    revalidateForModel('Service')
    return NextResponse.json({ item })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await db.service.delete({ where: { id } })
  revalidateForModel('Service')
  return NextResponse.json({ ok: true })
}
