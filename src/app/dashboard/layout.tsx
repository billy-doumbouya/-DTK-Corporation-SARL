import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Tableau de bord', template: '%s — Tableau de bord DTK' },
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth().catch(() => null)
  if (!user) redirect('/auth')

  return (
    <DashboardShell
      user={{ email: user.email, name: user.name, sessionStartedAt: user.sessionStartedAt }}
    >
      {children}
    </DashboardShell>
  )
}
