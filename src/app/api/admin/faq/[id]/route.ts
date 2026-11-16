import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { apiHandler } from '@/lib/api-wrap'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'
interface Params { params: Promise<{ id: string }> }

export const PATCH = apiHandler(async (request: NextRequest, { params }: Params) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const data: any = {}
  for (const k of ['question','answer','keywords']) {
    if (body[k] !== undefined) data[k] = String(body[k])
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.isPublished !== undefined) data.isPublished = !!body.isPublished
  const item = await db.faqItem.update({ where: { id }, data })
  revalidateForModel('FaqItem')
  await logAction(user.id, ACTIONS.FAQ_UPDATE, `id=${id}`)
  return NextResponse.json({ item })
}, 'admin/faq/[id] PATCH')

export const DELETE = apiHandler(async (_request: NextRequest, { params }: Params) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await db.faqItem.delete({ where: { id } })
  revalidateForModel('FaqItem')
  await logAction(user.id, ACTIONS.FAQ_DELETE, `id=${id}`)
  return NextResponse.json({ ok: true })
}, 'admin/faq/[id] DELETE')
