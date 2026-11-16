import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.partner.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const data: any = {
    name: String(body.name || '').trim(),
    logoUrl: body.logoUrl ? String(body.logoUrl) : null,
    websiteUrl: body.websiteUrl ? String(body.websiteUrl) : null,
    order: Number(body.order) || 0,
    isPublished: body.isPublished !== false,
  }
  if (!data.name) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
  const item = await db.partner.create({ data })
  revalidateForModel('Partner')
  return NextResponse.json({ item })
}
