import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.siteStat.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const data: any = {
    label: String(body.label || '').trim(),
    value: String(body.value || '').trim(),
    iconKey: String(body.iconKey || 'FaChartLine'),
    order: Number(body.order) || 0,
    isPublished: body.isPublished !== false,
  }
  if (!data.label) return NextResponse.json({ error: 'Libellé requis.' }, { status: 400 })
  const item = await db.siteStat.create({ data })
  revalidateForModel('SiteStat')
  return NextResponse.json({ item })
}
