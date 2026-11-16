'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export interface FieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'switch' | 'select' | 'date'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  help?: string
}

export interface ColumnDef {
  key: string
  label: string
  render?: (item: any) => React.ReactNode
}

interface ResourceManagerProps {
  apiPath: string // e.g. '/api/admin/services'
  columns: ColumnDef[]
  fields: FieldDef[]
  title: string
  description?: string
  revalidatePath?: string
  emptyMessage?: string
}

export function ResourceManager({
  apiPath,
  columns,
  fields,
  title,
  description,
  emptyMessage = 'Aucun élément.',
}: ResourceManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiPath)
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      toast.error('Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }, [apiPath])

  useEffect(() => {
    load()
  }, [load])

  async function saveItem(data: Record<string, any>, id?: string) {
    try {
      const method = id ? 'PATCH' : 'POST'
      const url = id ? `${apiPath}/${id}` : apiPath
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Erreur lors de l’enregistrement.')
        return false
      }
      toast.success(id ? 'Mis à jour.' : 'Créé avec succès.')
      setEditing(null)
      setCreating(false)
      load()
      router.refresh()
      return true
    } catch {
      toast.error('Erreur réseau.')
      return false
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression.')
        return
      }
      toast.success('Supprimé.')
      setDeleteId(null)
      load()
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    }
  }

  async function togglePublish(item: any) {
    const field = 'isPublished'
    const res = await fetch(`${apiPath}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !item[field] }),
    })
    if (res.ok) {
      toast.success(item[field] ? 'Masqué.' : 'Publié.')
      load()
      router.refresh()
    } else {
      toast.error('Erreur.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={() => { setEditing({}); setCreating(true) }}>
          <Icon name="FaPlus" size={14} className="mr-2" />
          Nouveau
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left font-medium">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">Chargement…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3">
                        {c.render ? c.render(item) : (typeof item[c.key] === 'boolean' ? (item[c.key] ? 'Oui' : 'Non') : String(item[c.key] ?? ''))}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {fields.some(f => f.name === 'isPublished') && (
                          <Button variant="ghost" size="sm" onClick={() => togglePublish(item)} title={item.isPublished ? 'Masquer' : 'Publier'}>
                            <Icon name={item.isPublished ? 'FaEye' : 'FaEyeSlash'} size={14} className={item.isPublished ? 'text-accent' : 'text-muted-foreground'} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setCreating(false) }} title="Modifier">
                          <Icon name="FaEdit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} title="Supprimer" className="text-destructive hover:text-destructive">
                          <Icon name="FaTrash" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create dialog */}
      {(editing !== null || creating) && (
        <EditDialog
          fields={fields}
          item={creating ? {} : editing}
          title={creating ? `Nouveau — ${title}` : `Modifier`}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={async (data) => {
            if (creating) return saveItem(data)
            return saveItem(data, editing?.id)
          }}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L’élément sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteItem(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EditDialog({
  fields,
  item,
  title,
  onClose,
  onSave,
}: {
  fields: FieldDef[]
  item: Record<string, any>
  title: string
  onClose: () => void
  onSave: (data: Record<string, any>) => Promise<boolean>
}) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init: Record<string, any> = {}
    for (const f of fields) {
      if (f.type === 'switch') init[f.name] = item[f.name] ?? false
      else if (f.type === 'number') init[f.name] = item[f.name] ?? 0
      else init[f.name] = item[f.name] ?? ''
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(init)
  }, [item, fields])

  function setField(name: string, value: any) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(values)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' ? 'col-span-2 space-y-1.5' : 'space-y-1.5'}>
                <Label htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {f.type === 'text' && (
                  <Input
                    id={f.name}
                    value={values[f.name] || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                )}
                {f.type === 'number' && (
                  <Input
                    id={f.name}
                    type="number"
                    value={values[f.name] || 0}
                    onChange={(e) => setField(f.name, Number(e.target.value))}
                    required={f.required}
                  />
                )}
                {f.type === 'date' && (
                  <Input
                    id={f.name}
                    type="datetime-local"
                    value={values[f.name] ? new Date(values[f.name]).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                  />
                )}
                {f.type === 'textarea' && (
                  <Textarea
                    id={f.name}
                    value={values[f.name] || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={4}
                    required={f.required}
                  />
                )}
                {f.type === 'switch' && (
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      id={f.name}
                      checked={!!values[f.name]}
                      onCheckedChange={(c) => setField(f.name, c)}
                    />
                    <span className="text-sm text-muted-foreground">{values[f.name] ? 'Oui' : 'Non'}</span>
                  </div>
                )}
                {f.type === 'select' && (
                  <Select value={values[f.name] || ''} onValueChange={(v) => setField(f.name, v)}>
                    <SelectTrigger id={f.name}><SelectValue placeholder={f.placeholder || 'Choisir…'} /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" /> : <Icon name="FaSave" size={14} className="mr-2" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
