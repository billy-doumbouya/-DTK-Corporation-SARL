'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  whatsapp: string
}

const NAV = [
  { href: '/', label: 'Accueil', icon: 'FaHome' },
  { href: '/a-propos', label: 'À propos', icon: 'FaUsers' },
  { href: '/realisations', label: 'Réalisations', icon: 'FaBuilding' },
  { href: '/actualites', label: 'Actualités', icon: 'FaNewspaper' },
  { href: '/partenaires', label: 'Partenaires', icon: 'FaHandshake' },
  { href: '/contact', label: 'Contact', icon: 'FaEnvelope' },
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
  const coreServices = services.filter((s) => !s.isSubcontracting)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="DTK Corporation — Accueil">
          { }
          <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          <NavItem href="/" label="Accueil" active={isActive('/')} />
          <NavItem href="/a-propos" label="À propos" active={isActive('/a-propos')} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent',
                  pathname.startsWith('/services') && 'text-accent'
                )}
              >
                Services
                <Icon name="FaChevronDown" size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
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

          <NavItem href="/sous-traitance" label="Sous-traitance" active={isActive('/sous-traitance')} />
          <NavItem href="/produits" label="Produits" active={isActive('/produits')} />
          <NavItem href="/realisations" label="Réalisations" active={isActive('/realisations')} />
          <NavItem href="/actualites" label="Actualités" active={isActive('/actualites')} />
          <NavItem href="/partenaires" label="Partenaires" active={isActive('/partenaires')} />
          <NavItem href="/contact" label="Contact" active={isActive('/contact')} />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Icon name="FaBars" size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  { }
                  <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="h-8 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Navigation mobile">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/10',
                      isActive(item.href) && 'bg-accent/10 text-accent'
                    )}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t" />
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Services
                </p>
                {coreServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/10"
                  >
                    <Icon name="FaArrowRight" size={10} className="text-accent" />
                    {s.shortTitle || s.title}
                  </Link>
                ))}
                <Link
                  href="/sous-traitance"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10"
                >
                  <Icon name="FaHandshake" size={16} />
                  Sous-traitance générale
                </Link>

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent',
        active && 'text-accent'
      )}
    >
      {label}
    </Link>
  )
}
