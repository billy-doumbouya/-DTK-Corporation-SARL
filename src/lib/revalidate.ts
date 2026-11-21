import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Centralized revalidation. Each public page has a stable path we can invalidate
 * when the admin edits content. Tag-based for settings & shared data.
 */
export const REVALIDATE_PATHS = {
  home: '/',
  about: '/a-propos',
  servicesList: '/services',
  serviceDetail: (slug: string) => `/services/${slug}`,
  products: '/produits',
  subcontracting: '/sous-traitance',
  realisations: '/realisations',
  realisationDetail: (slug: string) => `/realisations/${slug}`,
  news: '/actualites',
  newsDetail: (slug: string) => `/actualites/${slug}`,
  partners: '/partenaires',
  contact: '/contact',
  legal: '/mentions-legales',
  privacy: '/confidentialite',
} as const

export function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/a-propos')
  revalidatePath('/services')
  revalidatePath('/produits')
  revalidatePath('/sous-traitance')
  revalidatePath('/realisations')
  revalidatePath('/actualites')
  revalidatePath('/partenaires')
  revalidatePath('/contact')
  revalidatePath('/mentions-legales')
  revalidatePath('/confidentialite')
  revalidatePath('/sitemap.xml')
  revalidateTag('site-settings', 'max')
  revalidateTag('services', 'max')
  revalidateTag('slides', 'max')
  revalidateTag('partners', 'max')
  revalidateTag('faq', 'max')
  revalidateTag('news', 'max')
  revalidateTag('realisations', 'max')
  revalidateTag('products', 'max')
  revalidateTag('formations', 'max')
  revalidateTag('chatbot-knowledge', 'max')
}

export function revalidateForModel(model: string) {
  switch (model) {
    case 'Service':
    case 'ServiceImage':
      revalidatePath('/')
      revalidatePath('/services')
      revalidateTag('services', 'max')
      break
    case 'Product':
      revalidatePath('/produits')
      revalidateTag('products', 'max')
      break
    case 'Formation':
      revalidatePath('/services/formation')
      revalidateTag('formations', 'max')
      break
    case 'Slide':
      revalidatePath('/')
      revalidateTag('slides', 'max')
      break
    case 'Partner':
      revalidatePath('/')
      revalidatePath('/partenaires')
      revalidateTag('partners', 'max')
      break
    case 'NewsArticle':
      revalidatePath('/actualites')
      revalidateTag('news', 'max')
      break
    case 'Realisation':
    case 'RealisationImage':
      revalidatePath('/realisations')
      revalidateTag('realisations', 'max')
      break
    case 'FaqItem':
    case 'ChatbotKnowledge':
    case 'ChatbotModelConfig':
      revalidateTag('faq', 'max')
      revalidateTag('chatbot-knowledge', 'max')
      break
    case 'SiteSettings':
    case 'SiteStat':
    case 'Engagement':
    case 'SubcontractingPage':
      revalidateAll()
      break
    default:
      revalidateAll()
  }
}
