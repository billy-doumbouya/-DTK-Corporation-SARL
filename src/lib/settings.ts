import { db } from '@/lib/db'
import { unstable_cache } from 'next/cache'

/**
 * Site settings singleton helper. Reads the single SiteSettings row,
 * cached for 60s, revalidated on update via /api/revalidate.
 */
export type SiteSettings = Awaited<ReturnType<typeof getSiteSettingsRaw>>

async function getSiteSettingsRaw() {
  const s = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (!s) {
    // create on demand with defaults
    return db.siteSettings.create({ data: { id: 'singleton' } })
  }
  return s
}

export const getSiteSettings = unstable_cache(
  getSiteSettingsRaw,
  ['site-settings'],
  { revalidate: 60, tags: ['site-settings'] }
)

export async function updateSiteSettings(data: Partial<Awaited<ReturnType<typeof getSiteSettingsRaw>>>) {
  const current = await getSiteSettingsRaw()
  return db.siteSettings.update({ where: { id: 'singleton' }, data: { ...current, ...data } })
}

/**
 * Get the WhatsApp link from settings (wa.me/<number>).
 * Returns null if WhatsApp number is not configured.
 */
export function whatsappLink(number: string | undefined): string | null {
  if (!number) return null
  const cleaned = number.replace(/[^\d]/g, '')
  if (!cleaned) return null
  return `https://wa.me/${cleaned}`
}

/**
 * Tag list helper for split strings.
 */
export function splitList(s: string | null | undefined): string[] {
  if (!s) return []
  return s
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

/**
 * Parse a JSON-stored array of strings (features, domains, tags).
 */
export function parseStringArray(s: string | null | undefined): string[] {
  if (!s) return []
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : []
  } catch {
    return splitList(s)
  }
}

export function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr)
}
