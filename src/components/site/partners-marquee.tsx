'use client'

import Image from 'next/image'

interface PartnerData {
  id: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
}

export function PartnersMarquee({ partners }: { partners: PartnerData[] }) {
  if (partners.length === 0) return null
  // Duplicate for seamless loop
  const loop = [...partners, ...partners]
  return (
    <div className="relative overflow-hidden" aria-label="Nos partenaires">
      <div className="flex w-max animate-marquee gap-12 px-4">
        {loop.map((p, i) => (
          <PartnerLogo key={`${p.id}-${i}`} partner={p} />
        ))}
      </div>
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}

function PartnerLogo({ partner }: { partner: PartnerData }) {
  const inner = partner.logoUrl ? (
    <Image
      src={partner.logoUrl}
      alt={partner.name}
      width={140}
      height={60}
      className="h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
    />
  ) : (
    <span className="text-lg font-semibold text-muted-foreground/60">{partner.name}</span>
  )
  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 shrink-0 items-center"
        aria-label={partner.name}
      >
        {inner}
      </a>
    )
  }
  return <div className="flex h-14 shrink-0 items-center">{inner}</div>
}
