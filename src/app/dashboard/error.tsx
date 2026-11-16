'use client'

/**
 * Dashboard-specific error boundary.
 * Catches errors in dashboard pages while keeping the sidebar shell intact
 * (the dashboard layout wraps this, so the sidebar stays visible).
 */
import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
     
    console.error('[dashboard-error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <Icon name="FaExclamationTriangle" size={24} className="text-destructive" />
        </div>
        <h1 className="text-xl font-bold">Erreur dans le tableau de bord</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue lors du chargement de cette section. Vous pouvez
          réessayer ou revenir à l’accueil du tableau de bord.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">Référence : {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={reset} size="sm">
            <Icon name="FaCircleNotch" size={14} className="mr-2" />
            Réessayer
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <Icon name="FaHome" size={14} className="mr-2" />
              Accueil du tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
