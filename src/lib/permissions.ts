/**
 * Permission actions used across the app. The admin role gets ALL of them.
 * This list is consumed by the seed to populate the Permission table.
 */
export const PERMISSIONS = [
  // Dashboard access
  'dashboard.view',
  // Requests
  'requests.read',
  'requests.update_status',
  'requests.delete',
  'requests.export',
  'requests.add_note',
  // Services
  'services.read',
  'services.write',
  'services.delete',
  // Products
  'products.read',
  'products.write',
  'products.delete',
  // Formations
  'formations.read',
  'formations.write',
  'formations.delete',
  // Realisations
  'realisations.read',
  'realisations.write',
  'realisations.delete',
  // News
  'news.read',
  'news.write',
  'news.delete',
  // Slides
  'slides.read',
  'slides.write',
  'slides.delete',
  // Partners
  'partners.read',
  'partners.write',
  'partners.delete',
  // Stats & Engagements
  'stats.read',
  'stats.write',
  'stats.delete',
  'engagements.read',
  'engagements.write',
  'engagements.delete',
  // Subcontracting page
  'subcontracting.read',
  'subcontracting.write',
  // FAQ & Chatbot
  'faq.read',
  'faq.write',
  'faq.delete',
  'chatbot.read',
  'chatbot.write',
  // Media
  'media.read',
  'media.write',
  'media.delete',
  // Settings
  'settings.read',
  'settings.write',
  // Account
  'account.password.change',
  // Audit
  'audit.read',
] as const

export type PermissionAction = (typeof PERMISSIONS)[number]

export const ADMIN_ROLE = 'admin'
