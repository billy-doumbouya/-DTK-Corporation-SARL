import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const items = await db.engagement.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ items })
  } catch (e: any) {
     
    console.error('[admin/engagements] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const data: any = {
      title: String(body.title || '').trim(),
      description: String(body.description || '').trim(),
      iconKey: String(body.iconKey || 'FaShieldAlt'),
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== false,
    }
    if (!data.title) return NextResponse.json({ error: 'Titre requis.' }, { status: 400 })
    const item = await db.engagement.create({ data })
    revalidateForModel('Engagement')
    await logAction(user.id, ACTIONS.ENGAGEMENT_CREATE, `id=${item.id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
     
    console.error('[admin/engagements] POST error:', e)
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
