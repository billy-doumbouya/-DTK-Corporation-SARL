import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const items = await db.faqItem.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ items })
  } catch (e: any) {
     
    console.error('[admin/faq] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const data: any = {
      question: String(body.question || '').trim(),
      answer: String(body.answer || '').trim(),
      keywords: String(body.keywords || ''),
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== false,
    }
    if (!data.question || !data.answer) return NextResponse.json({ error: 'Question et réponse requises.' }, { status: 400 })
    const item = await db.faqItem.create({ data })
    revalidateForModel('FaqItem')
    return NextResponse.json({ item })
  } catch (e: any) {
     
    console.error('[admin/faq] POST error:', e)
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
