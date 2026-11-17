'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { cn } from '@/lib/utils'

interface SocialLinks {
  facebookUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
}

/**
 * Vertical social media bar — fixed on the left side.
 * Appears (fades in) when user scrolls down.
 * Minimalist design with icon-only buttons.
 */
export function SocialSidebar({ settings }: { settings: SocialLinks | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links: { url: string; icon: string; label: string; color: string }[] = []
  if (settings?.facebookUrl) links.push({ url: settings.facebookUrl, icon: 'FaFacebookF', label: 'Facebook', color: 'hover:bg-[#1877F2]' })
  if (settings?.linkedinUrl) links.push({ url: settings.linkedinUrl, icon: 'FaLinkedinIn', label: 'LinkedIn', color: 'hover:bg-[#0A66C2]' })
  if (settings?.instagramUrl) links.push({ url: settings.instagramUrl, icon: 'FaInstagram', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-[#E4405F] hover:to-[#F77737]' })

  if (links.length === 0) return null

  return (
    <div
      className={cn(
        'fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 transition-all duration-500 lg:block',
        visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      )}
    >
      <div className="flex flex-col gap-1 rounded-r-2xl border border-l-0 border-border bg-card/90 p-2 shadow-lg backdrop-blur">
        {/* Vertical label */}
        <div className="mb-1 flex justify-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            Suivez-nous
          </span>
        </div>
        <div className="h-px w-full bg-border" />
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:text-white',
              l.color
            )}
          >
            <Icon name={l.icon} size={16} />
          </a>
        ))}
      </div>
    </div>
  )
}
