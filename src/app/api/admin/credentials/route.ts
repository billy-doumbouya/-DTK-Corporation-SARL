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
    const items = await db.subcontractingCredential.findMany({ orderBy: { order: 'asc' } })
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
      label: String(body.label || '').trim(),
      value: String(body.value || '').trim(),
      iconKey: String(body.iconKey || 'FaShieldAlt'),
      category: String(body.category || 'legal'),
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== false,
    }
    if (!data.label) return NextResponse.json({ error: 'Libellé requis.' }, { status: 400 })
    const item = await db.subcontractingCredential.create({ data })
    revalidateForModel('SubcontractingPage')
    await logAction(user.id, 'credential.create', `id=${item.id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
