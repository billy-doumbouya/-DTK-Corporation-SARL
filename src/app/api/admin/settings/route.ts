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
    const settings = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json({ settings })
  } catch (e: any) {
     
    console.error('[admin/settings] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json().catch(() => ({}))

    const allowed: Record<string, any> = {}
    const stringFields = [
      'siteName','slogan','email','phone','whatsapp','addressLine','addressCity',
      'facebookUrl','linkedinUrl','instagramUrl','zones',
      'legalName','legalForm','legalId','legalCapital','legalAddress',
      'defaultSeoTitle','defaultSeoDescription','defaultOgImage','chatbotWelcome',
    ]
    for (const k of stringFields) {
      if (body[k] !== undefined) allowed[k] = String(body[k])
    }
    if (body.chatbotEnabled !== undefined) allowed.chatbotEnabled = !!body.chatbotEnabled
    if (body.customCursorEnabled !== undefined) allowed.customCursorEnabled = !!body.customCursorEnabled

    const current = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
    if (!current) {
      return NextResponse.json({ error: 'Settings not found.' }, { status: 404 })
    }

    const updated = await db.siteSettings.update({
      where: { id: 'singleton' },
      data: { ...current, ...allowed },
    })
    revalidateForModel('SiteSettings')
    await logAction(user.id, ACTIONS.SETTINGS_UPDATE, 'singleton')
    return NextResponse.json({ settings: updated })
  } catch (e: any) {
     
    console.error('[admin/settings] PATCH error:', e)
    return NextResponse.json({ error: 'Erreur lors de l’enregistrement.' }, { status: 500 })
  }
}
