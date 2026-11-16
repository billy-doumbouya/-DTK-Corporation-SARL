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
    const items = await db.slide.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ items })
  } catch (e: any) {
     
    console.error('[admin/slides] GET error:', e)
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
      subtitle: String(body.subtitle || '').trim(),
      buttonText: String(body.buttonText || 'En savoir plus'),
      buttonHref: String(body.buttonHref || '/services'),
      imageUrl: String(body.imageUrl || ''),
      imageAlt: String(body.imageAlt || ''),
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== false,
    }
    if (!data.title || !data.imageUrl) {
      return NextResponse.json({ error: 'Titre et image requis.' }, { status: 400 })
    }
    const item = await db.slide.create({ data })
    revalidateForModel('Slide')
    await logAction(user.id, ACTIONS.SLIDE_CREATE, `id=${item.id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
     
    console.error('[admin/slides] POST error:', e)
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
