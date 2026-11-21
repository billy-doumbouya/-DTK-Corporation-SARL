'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ModelConfig {
  id: string
  provider: string
  model: string
  order: number
  enabled: boolean
}

interface KnowledgeChunk {
  id: string
  source: string
  title: string
  content: string
  keywords: string
}

export function ChatbotConfig() {
  const router = useRouter()
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([])
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)
  const [newConfig, setNewConfig] = useState({ provider: 'gemini', model: 'gemini-2.0-flash', order: 1, enabled: true })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/chatbot')
      const data = await res.json()
      setConfigs(data.configs || [])
      setChunks(data.chunks || [])
    } catch {
      toast.error('Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function reindex() {
    setReindexing(true)
    try {
      const res = await fetch('/api/admin/chatbot?action=reindex', { method: 'GET' })
      if (res.ok) {
        toast.success('Base de connaissances réindexée.')
        load()
        router.refresh()
      } else {
        toast.error('Erreur.')
      }
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setReindexing(false)
    }
  }

  async function addConfig() {
    try {
      const res = await fetch('/api/admin/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (res.ok) {
        toast.success('Modèle ajouté.')
        setNewConfig({ provider: 'gemini', model: 'gemini-2.0-flash', order: configs.length + 1, enabled: true })
        load()
      } else {
        toast.error('Erreur.')
      }
    } catch {
      toast.error('Erreur réseau.')
    }
  }

  async function toggleConfig(c: ModelConfig) {
    const res = await fetch('/api/admin/chatbot', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, enabled: !c.enabled }),
    })
    if (res.ok) { toast.success('Mis à jour.'); load() }
  }

  async function deleteConfig(id: string) {
    const res = await fetch(`/api/admin/chatbot?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Supprimé.'); load() }
  }

  return (
    <div className="space-y-6">
      {/* Models */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Modèles configurés</h2>
          <Button onClick={reindex} disabled={reindexing} variant="outline" size="sm">
            {reindexing ? <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" /> : <Icon name="FaCircleNotch" size={14} className="mr-2" />}
            Réindexer la base
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Liste ordonnée des modèles. Si le premier est indisponible, le suivant est utilisé, puis la réponse de secours issue de la FAQ.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <div className="space-y-2">
            {configs.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Badge variant={c.enabled ? 'default' : 'secondary'}>{c.provider}</Badge>
                <span className="flex-1 font-mono text-sm">{c.model}</span>
                <span className="text-xs text-muted-foreground">ordre {c.order}</span>
                <Switch checked={c.enabled} onCheckedChange={() => toggleConfig(c)} />
                <Button variant="ghost" size="sm" onClick={() => deleteConfig(c.id)} className="text-destructive">
                  <Icon name="FaTrash" size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div className="mt-4 border-t pt-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Provider</Label>
              <Input value={newConfig.provider} onChange={(e) => setNewConfig({ ...newConfig, provider: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Modèle</Label>
              <Input value={newConfig.model} onChange={(e) => setNewConfig({ ...newConfig, model: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ordre</Label>
              <Input type="number" value={newConfig.order} onChange={(e) => setNewConfig({ ...newConfig, order: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <Button onClick={addConfig} className="w-full">
                <Icon name="FaPlus" size={14} className="mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge base */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 font-bold">Base de connaissances ({chunks.length} entrées)</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Extraits injectés dans le prompt du chatbot selon la similarité des mots-clés.
          Cliquez sur « Réindexer » pour reconstruire à partir des services et de la FAQ actuels.
        </p>
        <div className="max-h-96 space-y-2 overflow-y-auto scroll-thin">
          {chunks.map((c) => (
            <div key={c.id} className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{c.source}</Badge>
                <span className="text-sm font-medium">{c.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
