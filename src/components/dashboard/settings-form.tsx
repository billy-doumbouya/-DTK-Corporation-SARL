'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SettingsForm() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setData(d.settings))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [])

  function set(name: string, value: any) {
    setData((d: any) => ({ ...d, [name]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const r = await res.json()
        toast.error(r.error || 'Erreur.')
        return
      }
      toast.success('Paramètres enregistrés.')
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />
  if (!data) return <p className="text-muted-foreground">Impossible de charger les paramètres.</p>

  return (
    <form onSubmit={save} className="w-full min-w-0 space-y-8">
      {/* Identité */}
      <Section title="Identité" icon="FaBuilding">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldText label="Nom du site" value={data.siteName} onChange={(v) => set('siteName', v)} />
          <FieldText label="Slogan" value={data.slogan} onChange={(v) => set('slogan', v)} />
        </div>
      </Section>

      {/* Coordonnées */}
      <Section title="Coordonnées" icon="FaPhone">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldText label="Email" value={data.email} onChange={(v) => set('email', v)} placeholder="contact@dtk…" />
          <FieldText label="Téléphone" value={data.phone} onChange={(v) => set('phone', v)} />
          <FieldText label="WhatsApp (format international)" value={data.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="224xxxxxxxxx" help="Numéro sans + ni espaces, pour le bouton wa.me." />
          <FieldText label="Adresse (ligne)" value={data.addressLine} onChange={(v) => set('addressLine', v)} />
          <FieldText label="Ville" value={data.addressCity} onChange={(v) => set('addressCity', v)} />
        </div>
      </Section>

      {/* Réseaux */}
      <Section title="Réseaux sociaux" icon="FaShareAlt">
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldText label="Facebook" value={data.facebookUrl} onChange={(v) => set('facebookUrl', v)} />
          <FieldText label="LinkedIn" value={data.linkedinUrl} onChange={(v) => set('linkedinUrl', v)} />
          <FieldText label="Instagram" value={data.instagramUrl} onChange={(v) => set('instagramUrl', v)} />
        </div>
        <p className="text-xs text-muted-foreground">Les champs vides sont automatiquement masqués sur le site.</p>
      </Section>

      {/* Zones */}
      <Section title="Zones d’intervention" icon="FaGlobe">
        <FieldText label="Zones (séparées par virgules)" value={data.zones} onChange={(v) => set('zones', v)} />
      </Section>

      {/* Légal */}
      <Section title="Informations légales" icon="FaFileAlt">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldText label="Raison sociale" value={data.legalName} onChange={(v) => set('legalName', v)} />
          <FieldText label="Forme juridique" value={data.legalForm} onChange={(v) => set('legalForm', v)} />
          <FieldText label="N° d’immatriculation" value={data.legalId} onChange={(v) => set('legalId', v)} />
          <FieldText label="Capital social" value={data.legalCapital} onChange={(v) => set('legalCapital', v)} />
          <FieldText label="Adresse légale" value={data.legalAddress} onChange={(v) => set('legalAddress', v)} />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO (référencement)" icon="FaSearch">
        <FieldText label="Titre SEO par défaut" value={data.defaultSeoTitle} onChange={(v) => set('defaultSeoTitle', v)} />
        <FieldText label="Description SEO par défaut" value={data.defaultSeoDescription} onChange={(v) => set('defaultSeoDescription', v)} />
        <FieldText label="Image Open Graph (URL)" value={data.defaultOgImage} onChange={(v) => set('defaultOgImage', v)} />
      </Section>

      {/* Chatbot & UX */}
      <Section title="Chatbot & Expérience" icon="FaRobot">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Chatbot activé</Label>
            <p className="text-xs text-muted-foreground">Affiche la bulle de l’assistant virtuel.</p>
          </div>
          <Switch checked={!!data.chatbotEnabled} onCheckedChange={(c) => set('chatbotEnabled', c)} />
        </div>
        <FieldText label="Message de bienvenue du chatbot" value={data.chatbotWelcome} onChange={(v) => set('chatbotWelcome', v)} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Curseur personnalisé</Label>
            <p className="text-xs text-muted-foreground">Optionnel. Désactivé sur mobile.</p>
          </div>
          <Switch checked={!!data.customCursorEnabled} onCheckedChange={(c) => set('customCursorEnabled', c)} />
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end rounded-lg border border-border bg-background/90 p-3 backdrop-blur">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? <Icon name="FaCircleNotch" size={16} className="mr-2 animate-spin" /> : <Icon name="FaSave" size={16} className="mr-2" />}
          Enregistrer les paramètres
        </Button>
      </div>
    </form>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <Icon name={icon} size={16} className="text-accent" />
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function FieldText({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; help?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  )
}
