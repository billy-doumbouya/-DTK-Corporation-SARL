'use client'

import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
     
    console.error(error)
  }, [error])

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="bg-ellipse-dtk" aria-hidden="true" />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Icon name="FaExclamationTriangle" size={28} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">Une erreur est survenue</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Nous sommes désolés pour ce désagrément. Vous pouvez réessayer ou revenir à l’accueil.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">Référence : {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>
            <Icon name="FaCircleNotch" size={16} className="mr-2" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Icon name="FaHome" size={16} className="mr-2" />
              Retour à l’accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
