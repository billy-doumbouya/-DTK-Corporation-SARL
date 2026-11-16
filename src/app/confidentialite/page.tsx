import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du site DTK Corporation SARL.',
  alternates: { canonical: '/confidentialite' },
}

export const revalidate = 60

export default async function PrivacyPage() {
  const settings = await getSiteSettings()

  return (
    <div className="bg-grid-dtk">
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-extrabold md:text-4xl">Politique de confidentialité</h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Responsable du traitement</h2>
            <p className="mt-2">
              Le responsable du traitement des données est {settings?.legalName || 'DTK Corporation SARL'}.
              {settings?.email && <> Pour toute question : <a href={`mailto:${settings.email}`} className="text-accent hover:underline">{settings.email}</a>.</>}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">2. Données collectées</h2>
            <p className="mt-2">
              Nous collectons uniquement les données nécessaires au traitement de vos demandes
              envoyées via nos formulaires :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Nom complet</li>
              <li>Téléphone / WhatsApp</li>
              <li>Email</li>
              <li>Message et informations spécifiques à votre demande (activité, lieu, etc.)</li>
            </ul>
            <p className="mt-2">
              Le chatbot ne collecte aucune donnée personnelle sensible et n’enregistre pas
              vos conversations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">3. Finalités</h2>
            <p className="mt-2">
              Les données sont utilisées pour : répondre à vos demandes (devis, contact,
              inscription, sous-traitance, renseignements), vous envoyer un email de confirmation
              et vous recontacter si nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">4. Durée de conservation</h2>
            <p className="mt-2">
              Les demandes sont conservées pendant la durée nécessaire à leur traitement,
              puis archivées. Les demandes archivées sont supprimées après 3 ans d’inactivité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">5. Destinataires</h2>
            <p className="mt-2">
              Les données sont destinées exclusivement à l’équipe de{' '}
              {settings?.legalName || 'DTK Corporation SARL'}. Elles ne sont jamais vendues
              ni cédées à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">6. Vos droits</h2>
            <p className="mt-2">
              Conformément à la législation applicable, vous disposez d’un droit d’accès, de
              rectification, d’effacement et d’opposition concernant vos données. Pour exercer
              ces droits, contactez-nous via la{' '}
              <a href="/contact" className="text-accent hover:underline">page contact</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">7. Cookies</h2>
            <p className="mt-2">
              Ce site utilise un cookie de session strictement nécessaire à l’administration
              (httpOnly, sécurisé). Aucun cookie publicitaire ou de suivi tiers n’est déposé
              sans consentement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">8. Sécurité</h2>
            <p className="mt-2">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données : connexion chiffrée (HTTPS), validation des entrées,
              limitation des tentatives, journalisation des actions sensibles.
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
