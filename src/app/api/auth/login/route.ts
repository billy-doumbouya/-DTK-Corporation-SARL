import { NextRequest, NextResponse } from 'next/server'
import { authenticate, setSessionCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = loginSchema.safeParse({
      email: String(body.email || ''),
      password: String(body.password || ''),
    })
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json({ error: first?.message || 'Saisie invalide.' }, { status: 400 })
    }

    const ip = getClientIp(request)
    const result = await authenticate(parsed.data.email, parsed.data.password, ip)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    await setSessionCookie(result.token)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
     
    console.error('[auth/login] error:', e)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 })
  }
}
