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

/**
 * Wave divider — SVG curve transition from page to footer.
 */
function FooterWave() {
  return (
    <div className="relative leading-[0]">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="h-[40px] w-full md:h-[60px]"
        fill="var(--dtk-navy)"
      >
        <path d="M0 40 C240 70 480 10 720 30 C960 50 1200 70 1440 30 L1440 80 L0 80 Z" />
      </svg>
    </div>
  )
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
    <>
      <FooterWave />
      <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a1f5c] via-[#101B91] to-[#0d2b5e] text-white">
        {/* Watermark — subtle industrial imagery */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <img
            src="/images/subcontracting-bg.webp"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        {/* Decorative blue glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#08A9E8] opacity-[0.08] blur-[80px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#08A9E8] opacity-[0.06] blur-[80px]" aria-hidden="true" />

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-10 lg:grid-cols-4">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              {/* Logo on white badge for visibility on navy background */}
              <div className="inline-flex rounded-xl bg-white px-4 py-2 shadow-lg">
                <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-10 w-auto" />
              </div>
              {/* Tagline */}
              <p className="text-sm italic text-white/70">
                Ensemble, construisons un avenir durable
              </p>
              {/* Description */}
              <p className="text-sm leading-relaxed text-white/60">
                {settings?.legalName || 'DTK Corporation'}, une entreprise multisectorielle engagée pour le développement durable de la Guinée.
              </p>
              {/* Accent underline */}
              <div className="h-0.5 w-12 bg-gradient-to-r from-accent to-transparent" />
              {/* Social icons */}
              <div className="flex items-center gap-2 pt-2">
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-accent hover:scale-110">
                    <Icon name="FaFacebookF" size={14} />
                  </a>
                )}
                {settings?.linkedinUrl && (
                  <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-accent hover:scale-110">
                    <Icon name="FaLinkedinIn" size={14} />
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-accent hover:scale-110">
                    <Icon name="FaInstagram" size={14} />
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-[#25D366] hover:scale-110">
                    <Icon name="FaWhatsapp" size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                <span className="h-px w-6 bg-accent/50" />
                Navigation
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: '/', label: 'Accueil' },
                  { href: '/a-propos', label: 'À propos' },
                  { href: '/sous-traitance', label: 'Sous-traitance générale' },
                  { href: '/produits', label: 'Produits' },
                  { href: '/realisations', label: 'Réalisations' },
                  { href: '/actualites', label: 'Actualités' },
                  { href: '/partenaires', label: 'Partenaires' },
                  { href: '/contact', label: 'Contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-2 text-white/60 transition-colors hover:text-accent">
                      <Icon name="FaChevronRight" size={8} className="text-accent/40 group-hover:text-accent transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                <span className="h-px w-6 bg-accent/50" />
                Nos services
              </h3>
              <ul className="space-y-2.5 text-sm">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group flex items-center gap-2 text-white/60 transition-colors hover:text-accent">
                      <Icon name="FaChevronRight" size={8} className="text-accent/40 group-hover:text-accent transition-colors" />
                      {s.shortTitle || s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                <span className="h-px w-6 bg-accent/50" />
                Contact
              </h3>
              <ul className="space-y-3 text-sm">
                {settings?.email && (
                  <li className="flex items-start gap-2.5">
                    <Icon name="FaEnvelope" size={14} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`mailto:${settings.email}`} className="text-white/60 hover:text-accent transition-colors break-all">
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings?.phone && (
                  <li className="flex items-start gap-2.5">
                    <Icon name="FaPhone" size={14} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`tel:${settings.phone}`} className="text-white/60 hover:text-accent transition-colors">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {(settings?.addressLine || settings?.addressCity) && (
                  <li className="flex items-start gap-2.5">
                    <Icon name="FaMapMarkerAlt" size={14} className="mt-0.5 shrink-0 text-accent" />
                    <span className="text-white/60">
                      {settings?.addressLine}
                      {settings?.addressLine && settings?.addressCity ? ', ' : ''}
                      {settings?.addressCity}
                    </span>
                  </li>
                )}
                {zones.length > 0 && (
                  <li className="flex items-start gap-2.5">
                    <Icon name="FaGlobe" size={14} className="mt-0.5 shrink-0 text-accent" />
                    <span className="text-white/60">
                      Zones : {zones.join(', ')}
                    </span>
                  </li>
                )}
              </ul>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1da851] hover:scale-105"
                >
                  <Icon name="FaWhatsapp" size={16} />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright + legal */}
        <div className="relative z-10 border-t border-white/10 bg-[#0a1a4a]/60">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-white/50 md:flex-row md:px-6">
            <p>
              © {year} {settings?.legalName || 'DTK Corporation SARL'}. Tous droits réservés.
              {settings?.legalForm && ` — ${settings.legalForm}`}
            </p>
            <nav className="flex flex-wrap gap-4" aria-label="Liens légaux">
              <Link href="/mentions-legales" className="transition-colors hover:text-accent">Mentions légales</Link>
              <span className="text-white/20">|</span>
              <Link href="/confidentialite" className="transition-colors hover:text-accent">Politique de confidentialité</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
