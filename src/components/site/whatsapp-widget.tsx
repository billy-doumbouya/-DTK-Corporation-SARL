'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { cn } from '@/lib/utils'

interface WhatsAppWidgetProps {
  whatsapp: string
}

/**
 * Floating WhatsApp button — separate from the chatbot.
 * Appears on all public pages. Pops a small tooltip on hover.
 */
export function WhatsAppWidget({ whatsapp }: { whatsapp: string }) {
  const [show, setShow] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    // Show after slight delay + scroll
    const onScroll = () => setShow(window.scrollY > 100 || window.scrollY === 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const t = setTimeout(() => setShow(true), 800)
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [])

  if (!whatsapp) return null
  const cleaned = whatsapp.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const href = `https://wa.me/${cleaned}`

  return (
    <div
      className={cn(
        'fixed bottom-5 left-5 z-40 transition-all duration-500',
        show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      )}
    >
      <div className="relative">
        {/* Tooltip */}
        {tooltipOpen && (
          <div className="absolute bottom-0 left-16 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground shadow-lg">
            Discutons sur WhatsApp
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-primary" />
          </div>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter sur WhatsApp"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        >
          <Icon name="FaWhatsapp" size={28} />
          {/* Pulse ring */}
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        </a>
      </div>
    </div>
  )
}
