import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { stringifyArray } from '@/lib/settings'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const page = await db.subcontractingPage.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json({ page })
  } catch (e: any) {
     
    console.error('[admin/subcontracting] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const data: any = {}
    for (const k of ['headline','intro','imageUrl','imageAlt']) {
      if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k])
    }
    if (body.domains !== undefined) {
      data.domains = stringifyArray(
        Array.isArray(body.domains)
          ? body.domains
          : String(body.domains).split('\n').map((s: string) => s.trim()).filter(Boolean)
      )
    }

    const current = await db.subcontractingPage.findUnique({ where: { id: 'singleton' } })
    if (!current) {
      const created = await db.subcontractingPage.create({ data: { id: 'singleton', ...data } })
      revalidateForModel('SubcontractingPage')
      await logAction(user.id, ACTIONS.SUBCONTRACTING_UPDATE, 'singleton')
      return NextResponse.json({ page: created })
    }

    const updated = await db.subcontractingPage.update({ where: { id: 'singleton' }, data })
    revalidateForModel('SubcontractingPage')
    await logAction(user.id, ACTIONS.SUBCONTRACTING_UPDATE, 'singleton')
    return NextResponse.json({ page: updated })
  } catch (e: any) {
     
    console.error('[admin/subcontracting] PATCH error:', e)
    return NextResponse.json({ error: 'Erreur lors de l’enregistrement.' }, { status: 500 })
  }
}
