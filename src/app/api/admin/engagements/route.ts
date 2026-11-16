import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.engagement.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
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
  return NextResponse.json({ item })
}
