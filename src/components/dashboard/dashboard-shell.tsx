'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
  group?: string
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Accueil', icon: 'FaHome' },
  { href: '/dashboard/requests', label: 'Demandes', icon: 'FaFileAlt' },
  { href: '/dashboard/services', label: 'Services', icon: 'FaBuilding', group: 'Contenu' },
  { href: '/dashboard/products', label: 'Produits', icon: 'FaTag', group: 'Contenu' },
  { href: '/dashboard/formations', label: 'Formations', icon: 'FaGraduationCap', group: 'Contenu' },
  { href: '/dashboard/realisations', label: 'Réalisations', icon: 'FaImages', group: 'Contenu' },
  { href: '/dashboard/news', label: 'Actualités', icon: 'FaNewspaper', group: 'Contenu' },
  { href: '/dashboard/slides', label: 'Slider accueil', icon: 'FaImage', group: 'Accueil' },
  { href: '/dashboard/partners', label: 'Partenaires', icon: 'FaHandshake', group: 'Accueil' },
  { href: '/dashboard/engagements', label: 'Engagements', icon: 'FaShieldAlt', group: 'Accueil' },
  { href: '/dashboard/stats', label: 'Chiffres', icon: 'FaChartLine', group: 'Accueil' },
  { href: '/dashboard/subcontracting', label: 'Sous-traitance générale', icon: 'FaHandshake', group: 'Accueil' },
  { href: '/dashboard/credentials', label: 'Crédentials', icon: 'FaShieldAlt', group: 'Accueil' },
  { href: '/dashboard/references', label: 'Références', icon: 'FaFileAlt', group: 'Accueil' },
  { href: '/dashboard/faq', label: 'FAQ', icon: 'FaQuestionCircle', group: 'Chatbot' },
  { href: '/dashboard/chatbot', label: 'Configuration', icon: 'FaRobot', group: 'Chatbot' },
  { href: '/dashboard/media', label: 'Médias', icon: 'FaImages', group: 'Outils' },
  { href: '/dashboard/settings', label: 'Paramètres', icon: 'FaCog', group: 'Outils' },
  { href: '/dashboard/audit', label: 'Journal d’audit', icon: 'FaFileAlt', group: 'Outils' },
  { href: '/dashboard/account', label: 'Mon compte', icon: 'FaUser', group: 'Outils' },
]

interface SidebarContentProps {
  user: { email: string; name: string | null }
  onNavigate?: () => void
}

function SidebarContent({ user, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const groups: { title: string | null; items: NavItem[] }[] = []
  let currentGroup: string | undefined = undefined
  for (const item of NAV) {
    const g = item.group || null
    if (g !== currentGroup || groups.length === 0) {
      groups.push({ title: g, items: [] })
      currentGroup = g
    }
    groups[groups.length - 1].items.push(item)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-4">
        { }
        <img src="/dtk-logo.png" alt="DTK Corporation" className="h-8 w-auto brightness-0 invert" />
      </div>

      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
            <Icon name="FaUser" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name || 'Administrateur'}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 scroll-thin" aria-label="Navigation tableau de bord">
        {groups.map((group, i) => (
          <div key={i} className="mb-4">
            {group.title && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive(item.href)
                        ? 'bg-sidebar-accent text-accent font-medium'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <Icon name={item.icon} size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50">
          <Icon name="FaSignOutAlt" size={16} className="mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}

export function DashboardShell({
  user,
  children,
}: {
  user: { email: string; name: string | null }
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:flex">
        <SidebarContent user={user} />
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Icon name="FaBars" size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent user={user} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-foreground">Tableau de bord</h1>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
            >
              <Icon name="FaExternalLinkAlt" size={12} />
              Voir le site
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
