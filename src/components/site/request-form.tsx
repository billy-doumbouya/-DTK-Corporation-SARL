'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { REQUEST_TYPES, REQUEST_TYPE_LABELS, type RequestType } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface RequestFormProps {
  services: Option[]
  formations: Option[]
  whatsappLink: string | null
}

const TYPE_ICONS: Record<RequestType, string> = {
  devis: 'FaFileAlt',
  contact: 'FaEnvelope',
  formation: 'FaGraduationCap',
  'sous-traitance': 'FaHandshake',
  renseignements: 'FaInfoCircle',
}

const TYPE_DESCRIPTIONS: Record<RequestType, string> = {
  devis: 'Obtenez une estimation pour un projet (BTP, froid, agro…).',
  contact: 'Posez une question générale à l’équipe.',
  formation: 'Inscrivez-vous à une de nos formations.',
  'sous-traitance': 'Confiez-nous une mission en sous-traitance.',
  renseignements: 'Demandez des précisions sur nos activités.',
}

export function RequestForm({ services, formations, whatsappLink }: RequestFormProps) {
  const router = useRouter()
  const params = useSearchParams()
  const initialType = params.get('type') as RequestType | null
  const validInitial =
    initialType && REQUEST_TYPES.includes(initialType) ? initialType : null

  const [step, setStep] = useState<'type' | 'form'>(validInitial ? 'form' : 'type')
  const [type, setType] = useState<RequestType | null>(validInitial)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  // specific
  const [activity, setActivity] = useState('')
  const [needDescription, setNeedDescription] = useState('')
  const [location, setLocation] = useState('')
  const [desiredDelay, setDesiredDelay] = useState('')
  const [subject, setSubject] = useState('')
  const [formationChoice, setFormationChoice] = useState('')
  const [levelOrProfession, setLevelOrProfession] = useState('')
  const [city, setCity] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [domain, setDomain] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [delay, setDelay] = useState('')

  function chooseType(t: RequestType) {
    setType(t)
    setStep('form')
    setErrors({})
    const url = new URL(window.location.href)
    url.searchParams.set('type', t)
    window.history.replaceState({}, '', url.toString())
  }

  function backToType() {
    setStep('type')
    setType(null)
    setErrors({})
    const url = new URL(window.location.href)
    url.searchParams.delete('type')
    window.history.replaceState({}, '', url.toString())
  }

  function buildPayload() {
    const base = { fullName, phone, email, message, website }
    switch (type) {
      case 'devis':
        return { ...base, type, activity, needDescription, location, desiredDelay }
      case 'contact':
        return { ...base, type, subject }
      case 'formation':
        return { ...base, type, formationChoice, levelOrProfession, city }
      case 'sous-traitance':
        return {
          ...base,
          type,
          companyName,
          domain,
          workDescription,
          location,
          delay,
        }
      case 'renseignements':
        return { ...base, type, subject }
      default:
        return { ...base, type }
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) return
    setLoading(true)
    setErrors({})
    try {
      const payload = buildPayload()
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.fields) {
          const fe: Record<string, string> = {}
          for (const f of data.fields) {
            fe[f.path] = f.message
          }
          setErrors(fe)
          toast.error('Veuillez corriger les champs en erreur.')
        } else {
          toast.error(data.error || 'Erreur lors de l’envoi.')
        }
        return
      }
      setSuccess(true)
      toast.success('Votre demande a bien été envoyée !')
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-accent/30 bg-accent/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon name="FaCheckCircle" size={32} />
        </div>
        <h3 className="text-xl font-bold">Demande envoyée !</h3>
        <p className="mt-2 text-muted-foreground">
          Merci pour votre confiance. Notre équipe vous recontactera dans les meilleurs délais.
          Un email de confirmation vous a été envoyé.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push('/')} variant="outline">
            <Icon name="FaHome" size={16} className="mr-2" />
            Retour à l’accueil
          </Button>
          <Button onClick={() => { setSuccess(false); backToType(); resetForm(); }} variant="ghost">
            <Icon name="FaPlus" size={16} className="mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </Card>
    )
  }

  function resetForm() {
    setFullName(''); setPhone(''); setEmail(''); setMessage('')
    setActivity(''); setNeedDescription(''); setLocation(''); setDesiredDelay('')
    setSubject(''); setFormationChoice(''); setLevelOrProfession(''); setCity('')
    setCompanyName(''); setDomain(''); setWorkDescription(''); setDelay('')
  }

  if (step === 'type' || !type) {
    return (
      <div>
        <h2 className="mb-2 text-xl font-bold">Choisissez le type de demande</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Un seul formulaire, adapté à votre besoin.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {REQUEST_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => chooseType(t)}
              className={cn(
                'group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-accent hover:shadow-md'
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon name={TYPE_ICONS[t]} size={20} />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{REQUEST_TYPE_LABELS[t]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{TYPE_DESCRIPTIONS[t]}</p>
              </div>
              <Icon name="FaArrowRight" size={14} className="mt-1 text-muted-foreground group-hover:text-accent" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Site web (ne pas remplir)</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon name={TYPE_ICONS[type]} size={18} />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Type de demande</p>
            <p className="font-semibold">{REQUEST_TYPE_LABELS[type]}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={backToType}>
          <Icon name="FaArrowLeft" size={14} className="mr-1" />
          Changer
        </Button>
      </div>

      {/* Common fields */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Vos coordonnées
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="fullName" label="Nom complet" error={errors.fullName} required>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Mariama Diallo" required />
          </Field>
          <Field id="phone" label="Téléphone / WhatsApp" error={errors.phone} required>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex : +224 620 00 00 00" required />
          </Field>
        </div>
        <Field id="email" label="Email" error={errors.email} required>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
        </Field>
      </fieldset>

      {/* Type-specific fields */}
      {type === 'devis' && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Détails du devis
          </legend>
          <Field id="activity" label="Activité concernée" error={errors.activity} required>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="activity"><SelectValue placeholder="Choisir une activité" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="needDescription" label="Description du besoin" error={errors.needDescription} required>
            <Textarea id="needDescription" value={needDescription} onChange={(e) => setNeedDescription(e.target.value)} placeholder="Décrivez votre projet en quelques lignes…" rows={4} required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="location" label="Lieu" error={errors.location}>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex : Conakry" />
            </Field>
            <Field id="desiredDelay" label="Délai souhaité" error={errors.desiredDelay}>
              <Input id="desiredDelay" value={desiredDelay} onChange={(e) => setDesiredDelay(e.target.value)} placeholder="Ex : dans 2 mois" />
            </Field>
          </div>
        </fieldset>
      )}

      {type === 'formation' && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Détails de l’inscription
          </legend>
          <Field id="formationChoice" label="Formation choisie" error={errors.formationChoice} required>
            <Select value={formationChoice} onValueChange={setFormationChoice}>
              <SelectTrigger id="formationChoice"><SelectValue placeholder="Choisir une formation" /></SelectTrigger>
              <SelectContent>
                {formations.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
                <SelectItem value="autre">Autre / renseignez-moi</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="levelOrProfession" label="Niveau ou profession" error={errors.levelOrProfession} required>
              <Input id="levelOrProfession" value={levelOrProfession} onChange={(e) => setLevelOrProfession(e.target.value)} placeholder="Ex : diplômé Bac+2, professionnel BTP…" required />
            </Field>
            <Field id="city" label="Ville" error={errors.city} required>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex : Kankan" required />
            </Field>
          </div>
        </fieldset>
      )}

      {type === 'sous-traitance' && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Détails de la sous-traitance
          </legend>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="companyName" label="Nom de votre entreprise" error={errors.companyName} required>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex : Entreprise XYZ SARL" required />
            </Field>
            <Field id="domain" label="Domaine concerné" error={errors.domain} required>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger id="domain"><SelectValue placeholder="Choisir un domaine" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field id="workDescription" label="Description du travail à confier" error={errors.workDescription} required>
            <Textarea id="workDescription" value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Décrivez la mission…" rows={4} required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="location_sub" label="Lieu" error={errors.location}>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex : Siguiri" />
            </Field>
            <Field id="delay" label="Délai" error={errors.delay}>
              <Input value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="Ex : urgence / 1 mois" />
            </Field>
          </div>
        </fieldset>
      )}

      {(type === 'contact' || type === 'renseignements') && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sujet
          </legend>
          <Field id="subject" label="Sujet" error={errors.subject} required>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex : Demande de partenariat" required />
          </Field>
        </fieldset>
      )}

      {/* Message (common) */}
      <Field id="message" label="Votre message" error={errors.message} required>
        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Détaillez votre demande…" rows={5} required />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <>
              <Icon name="FaCircleNotch" size={16} className="mr-2 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Icon name="FaPaperPlane" size={16} className="mr-2" />
              Envoyer ma demande
            </>
          )}
        </Button>
        {whatsappLink && (
          <Button type="button" asChild variant="outline" size="lg">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Icon name="FaWhatsapp" size={18} className="mr-2 text-[#25D366]" />
              Ou WhatsApp
            </a>
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour traiter
        votre demande. Consultez notre{' '}
        <a href="/confidentialite" className="text-accent hover:underline">politique de confidentialité</a>.
      </p>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
