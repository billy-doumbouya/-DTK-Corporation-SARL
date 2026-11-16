import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site DTK Corporation SARL.',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: true, follow: true },
}

export const revalidate = 60

export default async function LegalPage() {
  const settings = await getSiteSettings()

  return (
    <div className="bg-grid-dtk">
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-extrabold md:text-4xl">Mentions légales</h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground">Éditeur du site</h2>
            <p className="mt-2">
              {settings?.legalName || 'DTK Corporation SARL'}
              {settings?.legalForm ? ` (${settings.legalForm})` : ''}
            </p>
            {settings?.legalAddress && <p>{settings.legalAddress}</p>}
            {settings?.legalCapital && <p>Capital social : {settings.legalCapital}</p>}
            {settings?.legalId && <p>Numéro d’immatriculation : {settings.legalId}</p>}
            {settings?.email && <p>Email : <a href={`mailto:${settings.email}`} className="text-accent hover:underline">{settings.email}</a></p>}
            {settings?.phone && <p>Téléphone : {settings.phone}</p>}
            {!settings?.legalId && !settings?.legalAddress && !settings?.legalCapital && (
              <p className="text-sm italic">
                Les informations légales détaillées seront complétées après confirmation par l’entreprise.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Directeur de la publication</h2>
            <p className="mt-2">Le représentant légal de {settings?.legalName || 'DTK Corporation SARL'}.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Hébergement</h2>
            <p className="mt-2">
              Ce site est hébergé par Vercel Inc. (ou par l’hébergeur configuré lors du déploiement).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Propriété intellectuelle</h2>
            <p className="mt-2">
              L’ensemble des contenus présents sur ce site (textes, images, logos) est la propriété
              de {settings?.legalName || 'DTK Corporation SARL'} ou de ses partenaires, sauf mention contraire.
              Toute reproduction sans autorisation préalable est interdite.
            </p>
            <p className="mt-2">
              Les images d’illustration proviennent du site Unsplash et sont utilisées conformément
              à ses conditions d’utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Données personnelles</h2>
            <p className="mt-2">
              Les données collectées via les formulaires de ce site sont utilisées uniquement pour
              traiter vos demandes. Elles ne sont jamais cédées à des tiers. Pour plus d’informations,
              consultez notre <a href="/confidentialite" className="text-accent hover:underline">politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Contact</h2>
            <p className="mt-2">
              Pour toute question relative aux mentions légales, contactez-nous via la{' '}
              <a href="/contact" className="text-accent hover:underline">page contact</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
