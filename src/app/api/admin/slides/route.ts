import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.slide.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
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
  return NextResponse.json({ item })
}
