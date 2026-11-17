'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { whatsappLink } from '@/lib/settings'

interface HeaderService {
  slug: string
  shortTitle: string | null
  title: string
  isSubcontracting: boolean
}

interface HeaderSettings {
  siteName: string
  slogan: string
  email: string
  phone: string
  whatsapp: string
  facebookUrl: string
  linkedinUrl: string
  instagramUrl: string
}

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: 'FaHome', hasDropdown: false },
  { href: '/a-propos', label: 'À propos', icon: 'FaUsers', hasDropdown: false },
  { href: '/services', label: 'Services', icon: 'FaBuilding', hasDropdown: true },
  { href: '/sous-traitance', label: 'Sous-traitance générale', icon: 'FaHandshake', hasDropdown: false },
  { href: '/produits', label: 'Produits', icon: 'FaTag', hasDropdown: false },
  { href: '/realisations', label: 'Réalisations', icon: 'FaImages', hasDropdown: false },
  { href: '/actualites', label: 'Actualités', icon: 'FaNewspaper', hasDropdown: false },
  { href: '/partenaires', label: 'Partenaires', icon: 'FaHandshake', hasDropdown: false },
  { href: '/contact', label: 'Contact', icon: 'FaEnvelope', hasDropdown: false },
]

export function SiteHeader({
  services,
  settings,
}: {
  services: HeaderService[]
  settings: HeaderSettings | null
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Hide top utility bar on scroll (smooth)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const coreServices = services.filter((s) => !s.isSubcontracting)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const hasContactInfo = settings?.email || settings?.phone
  const hasSocial = settings?.facebookUrl || settings?.linkedinUrl || settings?.instagramUrl

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* ─── Tier 1: Utility bar (navy) — hides on scroll ─── */}
      {(hasContactInfo || hasSocial) && (
        <div
          className={cn(
            'hidden bg-primary text-primary-foreground transition-all duration-300 ease-in-out lg:block overflow-hidden',
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
          )}
        >
          <div className="container mx-auto flex h-9 items-center justify-between px-6 text-xs">
            {/* Left: contact info */}
            <div className="flex items-center gap-4">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <Icon name="FaEnvelope" size={11} />
                  {settings.email}
                </a>
              )}
              {settings?.email && settings?.phone && (
                <span className="text-primary-foreground/30">|</span>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <Icon name="FaPhone" size={11} />
                  {settings.phone}
                </a>
              )}
            </div>
            {/* Right: social icons */}
            {hasSocial && (
              <div className="flex items-center gap-2">
                <span className="text-primary-foreground/50 mr-1">Suivez-nous :</span>
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15 hover:bg-accent transition-colors">
                    <Icon name="FaFacebookF" size={11} />
                  </a>
                )}
                {settings?.linkedinUrl && (
                  <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15 hover:bg-accent transition-colors">
                    <Icon name="FaLinkedinIn" size={11} />
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15 hover:bg-accent transition-colors">
                    <Icon name="FaInstagram" size={11} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tier 2: Main nav (white) ─── */}
      <div className="bg-background border-b border-border/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          {/* Left: Logo + tagline */}
          <Link href="/" className="flex items-center gap-3" aria-label="DTK Corporation — Accueil">
            <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-12 w-auto md:h-14" />
            <div className="hidden lg:block xl:border-l xl:border-accent/30 xl:pl-3">
              <p className="text-xs font-semibold leading-tight text-primary">
                Professionnalisme
              </p>
              <p className="text-xs font-semibold leading-tight text-primary">
                Qualité · Satisfaction
              </p>
            </div>
          </Link>

          {/* Center: Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => {
              if (item.hasDropdown && item.href === '/services') {
                return (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-all',
                          isActive(item.href)
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'text-foreground hover:bg-accent/10 hover:text-accent'
                        )}
                      >
                        {item.label}
                        <Icon name="FaChevronDown" size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {coreServices.map((s) => (
                        <DropdownMenuItem asChild key={s.slug}>
                          <Link href={`/services/${s.slug}`} className="flex items-center gap-2">
                            <Icon name="FaArrowRight" size={10} className="text-accent" />
                            <span>{s.shortTitle || s.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/services" className="flex items-center gap-2 font-medium">
                          <Icon name="FaList" size={12} />
                          Tous les services
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-foreground hover:bg-accent/10 hover:text-accent'
                  )}
                >
                  {isActive(item.href) && item.icon && <Icon name={item.icon} size={13} />}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: CTA + theme toggle + mobile menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden md:inline-flex rounded-full bg-gradient-to-r from-accent to-primary text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/contact">
                <Icon name="FaPaperPlane" size={14} className="mr-1.5" />
                Nous contacter
              </Link>
            </Button>
            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Icon name="FaBars" size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-10 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1" aria-label="Navigation mobile">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(item.href) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'
                      )}
                    >
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </Link>
                  ))}
                  {/* Services submenu */}
                  <div className="my-2 border-t pt-2">
                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Services
                    </p>
                    {coreServices.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10"
                      >
                        <Icon name="FaArrowRight" size={10} className="text-accent" />
                        {s.shortTitle || s.title}
                      </Link>
                    ))}
                  </div>
                  {/* Contact info in mobile menu */}
                  {(hasContactInfo || hasSocial) && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact
                      </p>
                      {settings?.email && (
                        <a href={`mailto:${settings.email}`} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:text-accent">
                          <Icon name="FaEnvelope" size={14} /> {settings.email}
                        </a>
                      )}
                      {settings?.phone && (
                        <a href={`tel:${settings.phone}`} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:text-accent">
                          <Icon name="FaPhone" size={14} /> {settings.phone}
                        </a>
                      )}
                      {hasSocial && (
                        <div className="flex gap-2 px-3 pt-2">
                          {settings?.facebookUrl && (
                            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-accent-foreground">
                              <Icon name="FaFacebookF" size={14} />
                            </a>
                          )}
                          {settings?.linkedinUrl && (
                            <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-accent-foreground">
                              <Icon name="FaLinkedinIn" size={14} />
                            </a>
                          )}
                          {settings?.instagramUrl && (
                            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-accent-foreground">
                              <Icon name="FaInstagram" size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <Button asChild className="mt-4 rounded-full">
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      <Icon name="FaPaperPlane" size={14} className="mr-2" />
                      Nous contacter
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
