import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSchemaForType, REQUEST_TYPES } from '@/lib/validators'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import {
  getMailer,
  buildAdminNotificationEmail,
  buildVisitorConfirmationEmail,
} from '@/lib/mailer'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

const ADMIN_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

/**
 * Single entry point for all request types.
 * Validates with the shared zod schema, persists, sends emails.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Rate limit: 5 requests / hour / IP
    const rl = rateLimit(`form:${ip}`, 5, 3600)
    if (!rl.ok) {
      return NextResponse.json(
        {
          error:
            'Trop de demandes envoyées depuis cette adresse. Veuillez réessayer dans une heure.',
        },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const type = String(body.type || '')

    if (!REQUEST_TYPES.includes(type as any)) {
      return NextResponse.json({ error: 'Type de demande invalide.' }, { status: 400 })
    }

    // Honeypot: the "website" field must be empty
    if (body.website && String(body.website).trim() !== '') {
      // Pretend success to not tip off the bot
      return NextResponse.json({ ok: true, id: 'spam-trapped' })
    }

    const schema = getSchemaForType(type)
    if (!schema) {
      return NextResponse.json({ error: 'Type de demande invalide.' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée.',
          fields: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const data = parsed.data as any

    // Extract common fields
    const { fullName, phone, email, message, website, ...extra } = data

    // Save to DB
    const record = await db.request.create({
      data: {
        type,
        fullName,
        phone,
        email,
        message,
        extraData: JSON.stringify(extra),
        status: 'nouveau',
        ip,
        userAgent,
      },
    })

    // Send emails (non-blocking but awaited)
    const mailer = getMailer()
    const adminMail = buildAdminNotificationEmail({
      type,
      fullName,
      phone,
      email,
      message,
      extraData: extra,
      requestId: record.id,
      adminUrl: ADMIN_URL,
    })
    const visitorMail = buildVisitorConfirmationEmail({ fullName, email, type })

    // Send both, don't fail the request if email fails
    const [adminRes, visitorRes] = await Promise.allSettled([
      mailer.send(adminMail),
      mailer.send(visitorMail),
    ])
    const adminMailError =
      adminRes.status === 'rejected'
        ? adminRes.reason
        : adminRes.value.ok ? null : adminRes.value.error
    const visitorMailError =
      visitorRes.status === 'rejected'
        ? visitorRes.reason
        : visitorRes.value.ok ? null : visitorRes.value.error
    if (adminMailError) console.error('[requests] admin email failed:', adminMailError)
    if (visitorMailError) console.error('[requests] visitor email failed:', visitorMailError)

    // Revalidate dashboard home counters
    revalidateForModel('Request')

    return NextResponse.json({ ok: true, id: record.id })
  } catch (e: any) {
     
    console.error('[requests] error:', e)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
