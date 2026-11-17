import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

/**
 * Hash a password using Node's scrypt (no external dependency).
 * Output format: "salt:hash" (both hex).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, 64) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

/**
 * Verify a password against a "salt:hash" string.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const derived = await scryptAsync(password, salt, 64) as Buffer
  const hashBuf = Buffer.from(hash, 'hex')
  if (derived.length !== hashBuf.length) return false
  return timingSafeEqual(derived, hashBuf)
}

/**
 * Minimal password policy: >= 8 chars, at least one letter and one digit.
 */
export function validatePasswordPolicy(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: 'Le mot de passe doit comporter au moins 8 caractères.' }
  if (!/[a-zA-Z]/.test(password)) return { ok: false, reason: 'Le mot de passe doit contenir au moins une lettre.' }
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'Le mot de passe doit contenir au moins un chiffre.' }
  return { ok: true }
}
