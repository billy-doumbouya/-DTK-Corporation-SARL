import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

/**
 * Wraps an admin API handler with auth check.
 * Returns 401 if not authenticated.
 */
export async function withAdmin<T>(
  handler: (user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<T>
): Promise<T | NextResponse> {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  return handler(user)
}

export async function getBody(request: NextRequest): Promise<any> {
  return request.json().catch(() => ({}))
}
