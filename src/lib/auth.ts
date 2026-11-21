import { db } from '@/lib/db'
import { hashPassword, verifyPassword, validatePasswordPolicy } from '@/lib/password'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'node:crypto'

export const SESSION_COOKIE = 'dtk_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12 // 12 hours

function randomToken(): string {
  return randomBytes(48).toString('base64url')
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken()
  await db.session.create({
    data: {
      tokenHash: tokenHash(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    },
  })
  return token
}

export function destroySession(token: string): void {
  void db.session.deleteMany({ where: { tokenHash: tokenHash(token) } }).catch(() => {})
}

export async function getSession(token: string | undefined) {
  if (!token) return null
  const entry = await db.session.findUnique({ where: { tokenHash: tokenHash(token) } })
  if (!entry || entry.expiresAt < new Date()) {
    if (entry) await db.session.delete({ where: { id: entry.id } }).catch(() => {})
    return null
  }
  return {
    userId: entry.userId,
    token,
    expiresAt: entry.expiresAt.getTime(),
    createdAt: entry.createdAt.getTime(),
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value
}

/**
 * Returns the current authenticated user (with roles + permissions) or null.
 */
export async function getCurrentUser() {
  const token = await getSessionToken()
  const entry = await getSession(token)
  if (!entry) return null
  const user = await db.user.findUnique({
    where: { id: entry.userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  })
  if (!user) return null
  return { ...user, sessionStartedAt: entry.createdAt }
}

/**
 * Returns the set of permission action strings for the current user.
 */
export async function getCurrentPermissions(): Promise<Set<string>> {
  const user = await getCurrentUser()
  if (!user) return new Set()
  const perms = new Set<string>()
  for (const ur of user.userRoles) {
    for (const rp of ur.role.rolePermissions) {
      perms.add(rp.permission.action)
    }
  }
  return perms
}

export async function can(action: string): Promise<boolean> {
  const perms = await getCurrentPermissions()
  return perms.has(action)
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')
  return user
}

/**
 * Authenticate a user with email + password. Handles rate limiting (lockout).
 */
export async function authenticate(email: string, password: string, ip?: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) {
    await db.auditLog.create({
      data: { action: 'login_failed', detail: `email=${email}`, ip },
    })
    return { ok: false as const, error: 'Identifiants incorrects.' }
  }

  // Lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      ok: false as const,
      error: `Compte temporairement verrouillé. Réessayez après ${user.lockedUntil.toLocaleTimeString('fr-FR')}.`,
    }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    const attempts = user.failedAttempts + 1
    const lockFor = attempts >= 10 ? 5 * 60 * 1000 : 0 // 5 min lock after 10 attempts (increased threshold)
    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: attempts,
        lockedUntil: lockFor ? new Date(Date.now() + lockFor) : null,
      },
    })
    await db.auditLog.create({
      data: { userId: user.id, action: 'login_failed', detail: `attempts=${attempts}`, ip },
    })
    return { ok: false as const, error: 'Identifiants incorrects.' }
  }

  // Reset on success
  await db.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  })
  await db.auditLog.create({
    data: { userId: user.id, action: 'login_success', ip },
  })

  const token = await createSession(user.id)
  return { ok: true as const, token }
}

export { validatePasswordPolicy, hashPassword, verifyPassword }
