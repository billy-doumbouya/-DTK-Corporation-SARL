import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/settings'
import { Reveal } from '@/components/site/reveal'
import { RichBackground, FloatingShapes, DotGrid } from '@/components/site/decor-background'
import { Icon } from '@/lib/icon'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du site DTK Corporation SARL.',
  alternates: { canonical: '/confidentialite' },
}

export const revalidate = 60

export default async function PrivacyPage() {
  const settings = await getSiteSettings()

  const sections = [
    { icon: 'FaUser', title: '1. Responsable du traitement', content: (
      <>
        <p>Le responsable du traitement des données est {settings?.legalName || 'DTK Corporation SARL'}.</p>
        {settings?.email && <p>Pour toute question : <a href={`mailto:${settings.email}`} className="text-accent hover:underline">{settings.email}</a>.</p>}
      </>
    )},
    { icon: 'FaDatabase', title: '2. Données collectées', content: (
      <>
        <p>Nous collectons uniquement les données nécessaires au traitement de vos demandes envoyées via nos formulaires :</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Nom complet</li>
          <li>Téléphone / WhatsApp</li>
          <li>Email</li>
          <li>Message et informations spécifiques à votre demande (activité, lieu, etc.)</li>
        </ul>
        <p className="mt-2">Le chatbot ne collecte aucune donnée personnelle sensible et n'enregistre pas vos conversations.</p>
      </>
    )},
    { icon: 'FaCog', title: '3. Finalités', content: (
      <p>Les données sont utilisées pour : répondre à vos demandes (devis, contact, inscription, sous-traitance, renseignements), vous envoyer un email de confirmation et vous recontacter si nécessaire.</p>
    )},
    { icon: 'FaClock', title: '4. Durée de conservation', content: (
      <p>Les demandes sont conservées pendant la durée nécessaire à leur traitement, puis archivées. Les demandes archivées sont supprimées après 3 ans d'inactivité.</p>
    )},
    { icon: 'FaUsers', title: '5. Destinataires', content: (
      <p>Les données sont destinées exclusivement à l'équipe de {settings?.legalName || 'DTK Corporation SARL'}. Elles ne sont jamais vendues ni cédées à des tiers.</p>
    )},
    { icon: 'FaShieldAlt', title: '6. Vos droits', content: (
      <p>Conformément à la législation applicable, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition concernant vos données. Pour exercer ces droits, contactez-nous via la <a href="/contact" className="text-accent hover:underline">page contact</a>.</p>
    )},
    { icon: 'FaInfoCircle', title: '7. Cookies', content: (
      <p>Ce site utilise un cookie de session strictement nécessaire à l'administration (httpOnly, sécurisé). Aucun cookie publicitaire ou de suivi tiers n'est déposé sans consentement.</p>
    )},
    { icon: 'FaLock', title: '8. Sécurité', content: (
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : connexion chiffrée (HTTPS), validation des entrées, limitation des tentatives, journalisation des actions sensibles.</p>
    )},
  ]

  return (
    <div className="bg-mesh-dtk">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0">
          <Image
            src="/images/abstract-waves.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101B91]/30 to-[#08A9E8]/20" />
          <FloatingShapes />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <Reveal direction="up">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-8 bg-accent/60" />
              Protection des données
            </p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Politique de confidentialité</h1>
            <p className="mt-3 text-primary-foreground/80">Comment nous protégeons et traitons vos données personnelles.</p>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <article className="relative overflow-hidden section-padding">
        <RichBackground />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {sections.map((s, i) => (
              <Reveal key={i} direction="up" delay={i * 0.05}>
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg md:p-8">
                  <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-accent/5 blur-2xl" />
                  <div className="relative z-10">
                    <h2 className="mb-3 flex items-center gap-3 text-xl font-bold">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-accent transition-transform group-hover:scale-110">
                        <Icon name={s.icon} size={18} />
                      </span>
                      {s.title}
                    </h2>
                    <div className="space-y-2 text-muted-foreground">{s.content}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
