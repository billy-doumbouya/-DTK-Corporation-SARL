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
  for (const k of ['title','subtitle','buttonText','buttonHref','imageUrl','imageAlt']) {
    if (body[k] !== undefined) data[k] = String(body[k])
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.isPublished !== undefined) data.isPublished = !!body.isPublished
  const item = await db.slide.update({ where: { id }, data })
  revalidateForModel('Slide')
  await logAction(user.id, ACTIONS.SLIDE_UPDATE, `id=${id}`)
  return NextResponse.json({ item })
}, 'admin/slides/[id] PATCH')

export const DELETE = apiHandler(async (_request: NextRequest, { params }: Params) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await db.slide.delete({ where: { id } })
  revalidateForModel('Slide')
  await logAction(user.id, ACTIONS.SLIDE_DELETE, `id=${id}`)
  return NextResponse.json({ ok: true })
}, 'admin/slides/[id] DELETE')
