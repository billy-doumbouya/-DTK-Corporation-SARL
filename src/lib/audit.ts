import { db } from '@/lib/db'

/**
 * Centralized audit log helper. Records an action performed by a user.
 * Non-blocking: errors are swallowed so the main operation is never affected.
 *
 * @param userId - The acting user's ID (or null if unknown)
 * @param action - Short action identifier (e.g. "service.create", "settings.update")
 * @param detail - Optional human-readable detail
 * @param ip - Optional IP address
 */
export async function logAction(
  userId: string | null | undefined,
  action: string,
  detail?: string,
  ip?: string
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || null,
        action,
        detail: detail || null,
        ip: ip || null,
      },
    })
  } catch (e) {
     
    console.error('[audit] failed to log action:', e)
  }
}

/**
 * Standard action names for consistency.
 */
export const ACTIONS = {
  // Auth
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  // Requests
  REQUEST_UPDATE_STATUS: 'request.update_status',
  REQUEST_DELETE: 'request.delete',
  REQUEST_ADD_NOTE: 'request.add_note',
  // Content CRUD
  SERVICE_CREATE: 'service.create',
  SERVICE_UPDATE: 'service.update',
  SERVICE_DELETE: 'service.delete',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  FORMATION_CREATE: 'formation.create',
  FORMATION_UPDATE: 'formation.update',
  FORMATION_DELETE: 'formation.delete',
  REALISATION_CREATE: 'realisation.create',
  REALISATION_UPDATE: 'realisation.update',
  REALISATION_DELETE: 'realisation.delete',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE: 'news.update',
  NEWS_DELETE: 'news.delete',
  SLIDE_CREATE: 'slide.create',
  SLIDE_UPDATE: 'slide.update',
  SLIDE_DELETE: 'slide.delete',
  PARTNER_CREATE: 'partner.create',
  PARTNER_UPDATE: 'partner.update',
  PARTNER_DELETE: 'partner.delete',
  ENGAGEMENT_CREATE: 'engagement.create',
  ENGAGEMENT_UPDATE: 'engagement.update',
  ENGAGEMENT_DELETE: 'engagement.delete',
  STAT_CREATE: 'stat.create',
  STAT_UPDATE: 'stat.update',
  STAT_DELETE: 'stat.delete',
  FAQ_CREATE: 'faq.create',
  FAQ_UPDATE: 'faq.update',
  FAQ_DELETE: 'faq.delete',
  // Settings & pages
  SETTINGS_UPDATE: 'settings.update',
  SUBCONTRACTING_UPDATE: 'subcontracting.update',
  // Chatbot
  CHATBOT_CONFIG_CREATE: 'chatbot.config.create',
  CHATBOT_CONFIG_UPDATE: 'chatbot.config.update',
  CHATBOT_CONFIG_DELETE: 'chatbot.config.delete',
  CHATBOT_REINDEX: 'chatbot.reindex',
  // Media
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
} as const
