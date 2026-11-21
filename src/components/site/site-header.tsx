'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const logoClicks = useRef<{ count: number; at: number }>({ count: 0, at: 0 })

  function handleLogoClick(event: React.MouseEvent) {
    event.preventDefault()
    const now = Date.now()
    const recent = now - logoClicks.current.at < 2000
    logoClicks.current = recent
      ? { count: logoClicks.current.count + 1, at: now }
      : { count: 1, at: now }
    if (logoClicks.current.count >= 5) {
      logoClicks.current = { count: 0, at: 0 }
      router.push('/auth')
    }
  }

  const coreServices = services.filter((s) => !s.isSubcontracting)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const hasContactInfo = settings?.email || settings?.phone
  const hasSocial = settings?.facebookUrl || settings?.linkedinUrl || settings?.instagramUrl

  return (
    <>
      {(hasContactInfo || hasSocial) && (
        <div className="hidden bg-primary text-primary-foreground lg:block">
          <div className="container mx-auto flex h-9 items-center justify-between gap-4 px-6 text-xs">
            {/* Left: contact info */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex min-w-0 max-w-[35vw] items-center gap-1.5 whitespace-nowrap transition-colors hover:text-accent">
                  <Icon name="FaEnvelope" size={11} className="shrink-0" />
                  <span className="truncate">{settings.email}</span>
                </a>
              )}
              {settings?.email && settings?.phone && (
                <span className="text-primary-foreground/30">|</span>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex min-w-0 max-w-[25vw] items-center gap-1.5 whitespace-nowrap transition-colors hover:text-accent">
                  <Icon name="FaPhone" size={11} className="shrink-0" />
                  <span className="truncate">{settings.phone}</span>
                </a>
              )}
            </div>
            {/* Right: social icons */}
            {hasSocial && (
              <div className="flex items-center gap-2">
                <span className="mr-1 whitespace-nowrap text-primary-foreground/50">Suivez-nous :</span>
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

      <header className="sticky top-0 z-40 w-full shadow-md">
      <div className="bg-background border-b border-border/60">
        <div className="container mx-auto flex h-20 items-center justify-between gap-3 px-4 md:gap-4 md:px-6">
          {/* Brand */}
          <Link href="/" onClick={handleLogoClick} className="flex shrink-0 items-center" aria-label="DTK Corporation — Accueil">
            <Image src="/dtk-logo.png" alt="DTK Corporation SARL" width={600} height={295} sizes="100px" priority className="animate-dtk-logo-build h-10 w-auto md:h-12" />
          </Link>

          {/* Center: Desktop nav */}
          <nav
            className="relative isolate hidden h-12 min-w-0 flex-1 items-center justify-center gap-0 xl:flex 2xl:h-14"
            aria-label="Navigation principale"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent via-primary to-primary"
              style={{ clipPath: 'polygon(1.75rem 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            {NAV_ITEMS.map((item) => {
              if (item.hasDropdown && item.href === '/services') {
                return (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'relative z-10 inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-2 text-xs font-medium transition-all 2xl:px-2 2xl:text-sm',
                          isActive(item.href)
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                        )}
                      >
                        {item.label}
                        <Icon name="FaChevronDown" size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64 max-w-[calc(100vw-2rem)]">
                      {coreServices.map((s) => (
                        <DropdownMenuItem asChild key={s.slug}>
                          <Link href={`/services/${s.slug}`} className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                            <Icon name="FaArrowRight" size={10} className="shrink-0 text-accent" />
                            <span className="truncate">{s.shortTitle || s.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/services" className="flex items-center gap-2 whitespace-nowrap font-medium">
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
                    'relative z-10 inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-1.5 py-2 text-xs font-medium transition-all 2xl:px-2 2xl:text-sm',
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: CTA + theme toggle + mobile menu */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden whitespace-nowrap rounded-full bg-gradient-to-r from-accent to-primary text-white shadow-md transition-all hover:shadow-lg md:inline-flex">
              <Link href="/contact">
                <Icon name="FaPaperPlane" size={14} className="mr-1.5" />
                Nous contacter
              </Link>
            </Button>
            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu">
                  <Icon name="FaBars" size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[calc(100vw-2rem)] max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Image src="/dtk-logo.png" alt="DTK Corporation SARL" width={600} height={295} sizes="100px" className="h-10 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex min-w-0 max-h-[calc(100dvh-8rem)] flex-col gap-1 overflow-y-auto scroll-thin pb-8" aria-label="Navigation mobile">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex min-w-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(item.href) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'
                      )}
                    >
                      <Icon name={item.icon} size={16} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
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
                        className="flex min-w-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10"
                      >
                        <Icon name="FaArrowRight" size={10} className="shrink-0 text-accent" />
                        <span className="min-w-0 flex-1 truncate">{s.shortTitle || s.title}</span>
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
                        <a href={`mailto:${settings.email}`} className="flex min-w-0 items-center gap-2 whitespace-nowrap px-3 py-1.5 text-sm hover:text-accent">
                          <Icon name="FaEnvelope" size={14} className="shrink-0" />
                          <span className="min-w-0 truncate">{settings.email}</span>
                        </a>
                      )}
                      {settings?.phone && (
                        <a href={`tel:${settings.phone}`} className="flex min-w-0 items-center gap-2 whitespace-nowrap px-3 py-1.5 text-sm hover:text-accent">
                          <Icon name="FaPhone" size={14} className="shrink-0" />
                          <span className="min-w-0 truncate">{settings.phone}</span>
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
    </>
  )
}
