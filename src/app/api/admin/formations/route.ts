import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.formation.findMany({ orderBy: { order: 'asc' }, include: { service: { select: { title: true } } } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const data: any = {
    serviceId: String(body.serviceId || ''),
    title: String(body.title || '').trim(),
    slug: String(body.slug || '').trim().toLowerCase().replace(/\s+/g, '-'),
    excerpt: String(body.excerpt || '').trim(),
    description: String(body.description || '').trim(),
    duration: String(body.duration || ''),
    audience: String(body.audience || ''),
    imageUrl: body.imageUrl ? String(body.imageUrl) : null,
    imageAlt: body.imageAlt ? String(body.imageAlt) : null,
    order: Number(body.order) || 0,
    isPublished: body.isPublished !== false,
  }
  if (!data.serviceId || !data.title || !data.slug) {
    return NextResponse.json({ error: 'Service, titre et slug requis.' }, { status: 400 })
  }
  try {
    const item = await db.formation.create({ data })
    revalidateForModel('Formation')
    return NextResponse.json({ item })
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
