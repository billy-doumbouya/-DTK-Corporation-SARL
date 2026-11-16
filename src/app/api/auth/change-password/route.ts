import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyPassword, hashPassword, validatePasswordPolicy } from '@/lib/password'
import { passwordChangeSchema } from '@/lib/validators'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const parsed = passwordChangeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Données invalides.' },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
    }

    const policy = validatePasswordPolicy(newPassword)
    if (!policy.ok) {
      return NextResponse.json({ error: policy.reason }, { status: 400 })
    }

    const newHash = await hashPassword(newPassword)
    await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } })
    await db.auditLog.create({
      data: { userId: user.id, action: 'password_change' },
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e: any) {
     
    console.error('[auth/change-password] error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
