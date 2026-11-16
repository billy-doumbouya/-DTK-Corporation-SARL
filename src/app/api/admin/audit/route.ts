import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { apiHandler } from '@/lib/api-wrap'

export const runtime = 'nodejs'

const PAGE_SIZE = 50

/**
 * GET /api/admin/audit
 * Query params: page, action, q (search in detail), userId
 * Returns paginated audit log entries with user info.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const action = url.searchParams.get('action') || undefined
  const q = url.searchParams.get('q')?.trim() || undefined
  const userId = url.searchParams.get('userId') || undefined

  const where = {
    AND: [
      action ? { action: { contains: action } } : {},
      userId ? { userId } : {},
      q
        ? {
            OR: [
              { detail: { contains: q } },
              { action: { contains: q } },
              { ip: { contains: q } },
            ],
          }
        : {},
    ],
  }

  const [total, items, actionCounts] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { email: true, name: true } },
      },
    }),
    db.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 20,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return NextResponse.json({
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    items: items.map((i) => ({
      id: i.id,
      action: i.action,
      detail: i.detail,
      ip: i.ip,
      createdAt: i.createdAt.toISOString(),
      user: i.user ? { email: i.user.email, name: i.user.name } : null,
    })),
    actionCounts: actionCounts.map((a) => ({ action: a.action, count: a._count })),
  })
}, 'admin/audit GET')
