'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  onLogout: () => void
  showBrand?: boolean
}

function SidebarContent({ user, onNavigate, onLogout, showBrand = true }: SidebarContentProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const groups: { title: string | undefined; items: NavItem[] }[] = []
  let currentGroup: string | undefined = undefined
  for (const item of NAV) {
    const g = item.group || undefined
    if (g !== currentGroup || groups.length === 0) {
      groups.push({ title: g, items: [] })
      currentGroup = g
    }
    groups[groups.length - 1].items.push(item)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#1a2332] text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex min-h-16 shrink-0 items-center border-b border-sidebar-border px-4 py-3">
        {showBrand ? (
          <Link href="/dashboard" onClick={onNavigate} className="group flex min-w-0 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/10 transition-transform duration-300 hover:scale-[1.02]">
            <Image src="/logo.png" alt="" width={32} height={32} priority className="h-9 w-9 shrink-0 rounded-lg" />
            <span className="min-w-0 text-left">
              <span className="block truncate text-xs font-extrabold tracking-wide text-[#101B91]">DTK CORPORATION</span>
              <span className="mt-0.5 block truncate text-[8px] font-semibold uppercase tracking-[0.08em] text-[#08A9E8]">Professionnalisme · Qualité · Satisfaction</span>
            </span>
          </Link>
        ) : (
          <SheetTitle className="text-sm font-bold text-white">Navigation DTK</SheetTitle>
        )}
      </div>

      <div className="relative z-10 shrink-0 border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-cyan-300 text-accent-foreground shadow-lg shadow-accent/20">
            <Icon name="FaUser" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name || 'Administrateur'}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 scroll-thin" aria-label="Navigation tableau de bord">
        {groups.map((group, i) => (
          <div key={i} className="mb-5">
            {group.title && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] transition-all duration-300 hover:-translate-y-px',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-[#2196F3]/20 via-[#2196F3]/10 to-transparent font-semibold text-white shadow-[inset_0_0_0_1px_rgba(33,150,243,0.2)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-[#2196F3] before:shadow-[0_0_12px_rgba(33,150,243,0.8)]'
                        : 'text-sidebar-foreground/75 hover:bg-white/[0.07] hover:text-white'
                    )}
                  >
                    <Icon name={item.icon} size={16} className={cn('shrink-0 transition-transform duration-300 group-hover:scale-110', isActive(item.href) ? 'text-[#2196F3]' : 'text-white/55 group-hover:text-[#2196F3]')} />
                    <span className="truncate">{item.label}</span>
                    {isActive(item.href) && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#2196F3] shadow-[0_0_10px_rgba(33,150,243,0.9)]" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative z-10 shrink-0 border-t border-sidebar-border p-3">
        <Button onClick={onLogout} variant="ghost" className="w-full justify-start rounded-xl text-sidebar-foreground/75 transition-all duration-300 hover:bg-red-400/10 hover:text-red-200">
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
  user: { email: string; name: string | null; sessionStartedAt: number }
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sessionDuration, setSessionDuration] = useState('0 s')
  const [today, setToday] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const activeItem = NAV.find((item) => (
    item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
  )) ?? NAV[0]

  useEffect(() => {
    const updateDuration = () => {
      const totalSeconds = Math.max(0, Math.floor((Date.now() - user.sessionStartedAt) / 1000))
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (days) setSessionDuration(`${days} j ${hours} h`)
      else if (hours) setSessionDuration(`${hours} h ${minutes} min`)
      else if (minutes) setSessionDuration(`${minutes} min ${seconds} s`)
      else setSessionDuration(`${seconds} s`)
    }

    updateDuration()
    const interval = window.setInterval(updateDuration, 1000)
    return () => window.clearInterval(interval)
  }, [user.sessionStartedAt])

  useEffect(() => {
    const updateDate = () => {
      const parts = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).formatToParts(new Date())
      const part = (type: string) => parts.find((value) => value.type === type)?.value || ''
      const weekday = part('weekday')
      const month = part('month').replace(/\.$/, '')

      setToday(`${weekday.charAt(0).toLocaleUpperCase('fr-FR')}${weekday.slice(1)}, ${part('day')} ${month} ${part('year')}`)
    }

    updateDate()
    const interval = window.setInterval(updateDate, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  async function confirmLogout() {
    setLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'La déconnexion a échoué.')

      toast.success('Déconnexion réussie', {
        description: `Votre session a duré ${sessionDuration}.`,
      })
      setLogoutOpen(false)
      setOpen(false)
      router.replace('/auth')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur réseau lors de la déconnexion.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:flex">
        <SidebarContent user={user} onLogout={() => setLogoutOpen(true)} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-16 lg:pl-64">
        {/* Topbar */}
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-0 z-30 isolate grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden border-b border-border/70 bg-background/70 px-4 shadow-[0_8px_32px_-20px_rgba(16,27,145,0.45)] backdrop-blur-2xl md:px-6 lg:left-64"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 left-[35%] h-56 w-72 rounded-full bg-accent/20 blur-3xl"
            animate={reduceMotion ? undefined : {
              x: [0, 90, 0],
              scale: [0.85, 1.12, 0.85],
              opacity: [0.2, 0.48, 0.2],
            }}
            transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
          <div className="relative z-10 flex min-w-0 items-center justify-self-start">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl border border-border/70 bg-background/70 shadow-sm transition-all hover:border-accent/40 hover:bg-accent/10 lg:hidden" aria-label="Menu">
                  <Icon name="FaBars" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                closeClassName="z-[60] flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-100 shadow-md hover:bg-white/20 hover:text-white focus:ring-white/50"
                className="w-72 border-r border-white/10 bg-[#1a2332] p-0 text-white shadow-2xl"
              >
                <SidebarContent
                  user={user}
                  onNavigate={() => setOpen(false)}
                  onLogout={() => {
                    setOpen(false)
                    setLogoutOpen(true)
                  }}
                  showBrand={false}
                />
              </SheetContent>
            </Sheet>
          </div>
          <div className={cn(
            'relative z-10 flex min-w-0 items-center gap-3 text-left',
            activeItem.href === '/dashboard' ? 'justify-self-end sm:justify-self-start' : 'justify-self-start'
          )}>
            {activeItem.href === '/dashboard' && (
              <Image
                src="/logo.png"
                alt="DTK Corporation"
                width={600}
                height={295}
                priority
                className="h-[54px] w-[132px] rounded-sm bg-white object-contain p-0.5 sm:hidden"
              />
            )}
            <div className={cn('min-w-0 items-center gap-3', activeItem.href === '/dashboard' ? 'hidden sm:flex' : 'flex')}>
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/20 sm:flex">
                <Icon name={activeItem.icon} size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">{activeItem.label}</p>
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">Espace d’administration · DTK</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 justify-self-end sm:gap-3">
            {today && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-2 py-1.5 text-[10px] font-semibold tabular-nums text-muted-foreground shadow-sm sm:px-2.5 sm:text-xs">
                <Icon name="FaCalendarAlt" size={12} className="text-accent" />
                {today}
              </span>
            )}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/10 hover:text-foreground sm:flex"
            >
              <Icon name="FaExternalLinkAlt" size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Voir le site
            </a>
          </div>
        </motion.header>
        <main className="w-full min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#111b2d] p-0 text-white shadow-[0_24px_80px_rgba(2,8,23,0.5)] sm:max-w-md">
          <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-200 shadow-lg">
                <Icon name="FaSignOutAlt" size={20} />
              </span>
              <AlertDialogTitle className="text-xl font-bold tracking-tight text-white">
                Terminer votre session ?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-slate-300">
                Vous allez être déconnecté de l’espace d’administration DTK.
              </AlertDialogDescription>
            </div>
          </div>
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200">
                <Icon name="FaClock" size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Temps passé depuis la connexion
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-white">{sessionDuration}</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="border-t border-white/10 p-6 sm:p-7">
            <AlertDialogCancel
              disabled={loggingOut}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Rester connecté
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={confirmLogout}
              disabled={loggingOut}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30 hover:from-blue-500 hover:to-indigo-500"
            >
              {loggingOut ? (
                <Icon name="FaCircleNotch" size={14} className="animate-spin" />
              ) : (
                <Icon name="FaSignOutAlt" size={14} />
              )}
              {loggingOut ? 'Déconnexion…' : 'Me déconnecter'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
