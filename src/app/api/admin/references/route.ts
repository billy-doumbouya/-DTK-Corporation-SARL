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
    const items = await db.subcontractingReference.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const data: any = {
      clientName: String(body.clientName || '').trim(),
      missionType: String(body.missionType || 'Forfait'),
      domain: String(body.domain || 'BTP'),
      scope: String(body.scope || ''),
      duration: String(body.duration || ''),
      location: String(body.location || ''),
      status: String(body.status || 'delivered'),
      testimonial: body.testimonial ? String(body.testimonial) : null,
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== false,
    }
    if (!data.clientName) return NextResponse.json({ error: 'Nom du donneur d.ordre requis.' }, { status: 400 })
    const item = await db.subcontractingReference.create({ data })
    revalidateForModel('SubcontractingPage')
    await logAction(user.id, 'reference.create', `id=${item.id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
