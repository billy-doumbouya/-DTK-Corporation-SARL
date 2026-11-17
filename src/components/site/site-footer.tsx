import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { whatsappLink, splitList } from '@/lib/settings'
import { db } from '@/lib/db'

interface FooterSettings {
  siteName: string
  slogan: string
  email: string
  phone: string
  whatsapp: string
  addressLine: string
  addressCity: string
  facebookUrl: string
  linkedinUrl: string
  instagramUrl: string
  zones: string
  legalName: string
  legalForm: string
}

export async function SiteFooter({ settings }: { settings: FooterSettings | null }) {
  const services = await db.service
    .findMany({
      where: { isPublished: true, isSubcontracting: false },
      orderBy: { order: 'asc' },
      select: { slug: true, shortTitle: true, title: true },
    })
    .catch(() => [])

  const wa = whatsappLink(settings?.whatsapp)
  const zones = splitList(settings?.zones)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            { }
            <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-10 w-auto brightness-0 invert" />
            <p className="text-sm text-primary-foreground/80">{settings?.slogan}</p>
            <p className="text-xs text-primary-foreground/60">
              {settings?.legalName || 'DTK Corporation SARL'}
              {settings?.legalForm ? ` — ${settings.legalForm}` : ''}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-primary-foreground/70 hover:text-accent transition-colors">Accueil</Link></li>
              <li><Link href="/a-propos" className="text-primary-foreground/70 hover:text-accent transition-colors">À propos</Link></li>
              <li><Link href="/sous-traitance" className="text-primary-foreground/70 hover:text-accent transition-colors">Sous-traitance générale</Link></li>
              <li><Link href="/produits" className="text-primary-foreground/70 hover:text-accent transition-colors">Produits</Link></li>
              <li><Link href="/realisations" className="text-primary-foreground/70 hover:text-accent transition-colors">Réalisations</Link></li>
              <li><Link href="/actualites" className="text-primary-foreground/70 hover:text-accent transition-colors">Actualités</Link></li>
              <li><Link href="/partenaires" className="text-primary-foreground/70 hover:text-accent transition-colors">Partenaires</Link></li>
              <li><Link href="/contact" className="text-primary-foreground/70 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Nos services
            </h3>
            <ul className="space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {s.shortTitle || s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              {settings?.email && (
                <li className="flex items-center gap-2">
                  <Icon name="FaEnvelope" size={14} className="text-accent shrink-0" />
                  <a href={`mailto:${settings.email}`} className="text-primary-foreground/70 hover:text-accent transition-colors break-all">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-2">
                  <Icon name="FaPhone" size={14} className="text-accent shrink-0" />
                  <a href={`tel:${settings.phone}`} className="text-primary-foreground/70 hover:text-accent transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {(settings?.addressLine || settings?.addressCity) && (
                <li className="flex items-start gap-2">
                  <Icon name="FaMapMarkerAlt" size={14} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-primary-foreground/70">
                    {settings.addressLine}
                    {settings.addressLine && settings.addressCity ? ', ' : ''}
                    {settings.addressCity}
                  </span>
                </li>
              )}
              {zones.length > 0 && (
                <li className="flex items-start gap-2">
                  <Icon name="FaGlobe" size={14} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-primary-foreground/70">
                    Zones : {zones.join(', ')}
                  </span>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1da851] transition-colors"
                  >
                    <Icon name="FaWhatsapp" size={14} />
                    WhatsApp
                  </a>
                </li>
              )}
              {(settings?.facebookUrl || settings?.linkedinUrl || settings?.instagramUrl) && (
                <li className="flex items-center gap-3 pt-1">
                  {settings?.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/70 hover:text-accent">
                      <Icon name="FaFacebookF" size={16} />
                    </a>
                  )}
                  {settings?.linkedinUrl && (
                    <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/70 hover:text-accent">
                      <Icon name="FaLinkedinIn" size={16} />
                    </a>
                  )}
                  {settings?.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/70 hover:text-accent">
                      <Icon name="FaInstagram" size={16} />
                    </a>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings?.legalName || 'DTK Corporation SARL'}. Tous droits réservés.
          </p>
          <nav className="flex flex-wrap gap-4" aria-label="Liens légaux">
            <Link href="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
