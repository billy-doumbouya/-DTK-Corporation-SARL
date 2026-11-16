import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="bg-ellipse-dtk" aria-hidden="true" />
      <div className="relative z-10 text-center">
        <p className="text-7xl font-extrabold text-primary md:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold md:text-3xl">Page introuvable</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          La page que vous cherchez n’existe pas ou a été déplacée. Vous pouvez revenir
          à l’accueil ou explorer nos services.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Icon name="FaHome" size={16} className="mr-2" />
              Retour à l’accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/services">
              <Icon name="FaList" size={16} className="mr-2" />
              Voir nos services
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">
              <Icon name="FaEnvelope" size={16} className="mr-2" />
              Nous contacter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
