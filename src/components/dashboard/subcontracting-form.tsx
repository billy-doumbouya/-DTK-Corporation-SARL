'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SubcontractingForm() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/subcontracting')
      .then((r) => r.json())
      .then((d) => setData(d.page))
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
      const res = await fetch('/api/admin/subcontracting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const r = await res.json(); toast.error(r.error || 'Erreur.'); return }
      toast.success('Page enregistrée.')
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />
  if (!data) return <p className="text-muted-foreground">Erreur.</p>

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="headline">Titre de la page</Label>
          <Input id="headline" value={data.headline || ''} onChange={(e) => set('headline', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="intro">Introduction</Label>
          <Textarea id="intro" value={data.intro || ''} onChange={(e) => set('intro', e.target.value)} rows={5} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="domains">Domaines couverts (un par ligne)</Label>
          <Textarea
            id="domains"
            value={Array.isArray(data.domains) ? data.domains.join('\n') : (typeof data.domains === 'string' && data.domains.startsWith('[') ? JSON.parse(data.domains).join('\n') : data.domains || '')}
            onChange={(e) => set('domains', e.target.value)}
            rows={6}
            placeholder="BTP — Bâtiment et Travaux Publics&#10;Agro-alimentaire&#10;…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">URL image</Label>
            <Input id="imageUrl" value={data.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageAlt">Texte alternatif</Label>
            <Input id="imageAlt" value={data.imageAlt || ''} onChange={(e) => set('imageAlt', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Institutional fields */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Icon name="FaShieldAlt" size={16} className="text-accent" />
          Informations institutionnelles
        </h3>
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacité opérationnelle</Label>
          <Textarea id="capacity" value={data.capacity || ''} onChange={(e) => set('capacity', e.target.value)} rows={3} placeholder="Effectif, matériel, capacité d'intervention..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="insuranceInfo">Assurances professionnelles</Label>
          <Textarea id="insuranceInfo" value={data.insuranceInfo || ''} onChange={(e) => set('insuranceInfo', e.target.value)} rows={3} placeholder="RC Professionnelle, couverture..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="legalFramework">Cadre juridique</Label>
          <Textarea id="legalFramework" value={data.legalFramework || ''} onChange={(e) => set('legalFramework', e.target.value)} rows={3} placeholder="Types de contrats, conditions générales..." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" /> : <Icon name="FaSave" size={14} className="mr-2" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
