import { NextResponse } from 'next/server'
import { getSessionToken, getSession, destroySession, clearSessionCookie } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST() {
  const token = await getSessionToken()
  const session = getSession(token)
  if (session) {
    destroySession(session.token)
    await db.auditLog.create({
      data: { userId: session.userId, action: 'logout' },
    }).catch(() => {})
  }
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
