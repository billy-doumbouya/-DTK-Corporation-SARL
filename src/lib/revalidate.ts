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
  revalidatePath('/services', 'page')
  revalidatePath('/produits')
  revalidatePath('/sous-traitance')
  revalidatePath('/realisations')
  revalidatePath('/realisations', 'page')
  revalidatePath('/actualites')
  revalidatePath('/actualites', 'page')
  revalidatePath('/partenaires')
  revalidatePath('/contact')
  revalidatePath('/mentions-legales')
  revalidatePath('/confidentialite')
  revalidatePath('/sitemap.xml')
  revalidateTag('site-settings')
  revalidateTag('services')
  revalidateTag('slides')
  revalidateTag('partners')
  revalidateTag('faq')
  revalidateTag('news')
  revalidateTag('realisations')
  revalidateTag('products')
  revalidateTag('formations')
  revalidateTag('chatbot-knowledge')
}

export function revalidateForModel(model: string) {
  switch (model) {
    case 'Service':
    case 'ServiceImage':
      revalidatePath('/')
      revalidatePath('/services')
      revalidatePath('/services', 'page')
      revalidateTag('services')
      break
    case 'Product':
      revalidatePath('/produits')
      revalidateTag('products')
      break
    case 'Formation':
      revalidatePath('/services/formation')
      revalidateTag('formations')
      break
    case 'Slide':
      revalidatePath('/')
      revalidateTag('slides')
      break
    case 'Partner':
      revalidatePath('/')
      revalidatePath('/partenaires')
      revalidateTag('partners')
      break
    case 'NewsArticle':
      revalidatePath('/actualites')
      revalidatePath('/actualites', 'page')
      revalidateTag('news')
      break
    case 'Realisation':
    case 'RealisationImage':
      revalidatePath('/realisations')
      revalidatePath('/realisations', 'page')
      revalidateTag('realisations')
      break
    case 'FaqItem':
    case 'ChatbotKnowledge':
    case 'ChatbotModelConfig':
      revalidateTag('faq')
      revalidateTag('chatbot-knowledge')
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
