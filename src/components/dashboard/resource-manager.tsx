'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Icon } from '@/lib/icon'
import { Badge } from '@/components/ui/badge'
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
  type: 'text' | 'textarea' | 'number' | 'switch' | 'select' | 'date' | 'image'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  help?: string
  altField?: string
}

export interface ColumnDef {
  key: string
  label: string
  format?:
    | 'text-medium'
    | 'text-muted'
    | 'text-muted-xs'
    | 'text-muted-xs-clamp'
    | 'text-medium-clamp'
    | 'text-primary-bold'
    | 'code'
    | 'badge'
    | 'mapped-badge'
    | 'published'
    | 'icon'
    | 'icon-tile'
    | 'image'
    | 'date-muted-xs'
    | 'link-muted-xs'
    | 'service-title'
  fallback?: string
  altKey?: string
  imageFit?: 'contain' | 'cover'
  labels?: Record<string, string>
  variants?: Record<string, 'default' | 'secondary' | 'outline'>
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

function ImagePlaceholder() {
  return (
    <span className="inline-flex h-12 w-16 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground" aria-label="Image indisponible">
      <Icon name="FaImage" size={16} />
    </span>
  )
}

function ResourceImage({ src, alt, fit }: { src: string; alt: string; fit: 'contain' | 'cover' }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <ImagePlaceholder />

  return (
    <span className="inline-flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
      <Image
        src={src}
        alt={alt}
        width={96}
        height={72}
        unoptimized
        className={cn('h-full w-full', fit === 'contain' ? 'object-contain p-1' : 'object-cover')}
        onError={() => setFailed(true)}
      />
    </span>
  )
}

function renderColumn(column: ColumnDef, item: Record<string, unknown>) {
  const rawValue = item[column.key]
  const value = rawValue == null || rawValue === '' ? column.fallback ?? '' : String(rawValue)
  const label = column.labels?.[String(rawValue)] ?? value

  switch (column.format) {
    case 'text-medium':
      return <span className="font-medium">{label}</span>
    case 'text-muted':
      return <span className="text-muted-foreground">{label}</span>
    case 'text-muted-xs':
      return <span className="text-xs text-muted-foreground">{label}</span>
    case 'text-muted-xs-clamp':
      return <span className="line-clamp-1 text-xs text-muted-foreground">{label}</span>
    case 'text-medium-clamp':
      return <span className="line-clamp-1 font-medium">{label}</span>
    case 'text-primary-bold':
      return <span className="font-bold text-primary">{label}</span>
    case 'code':
      return <code className="text-xs text-muted-foreground">{label}</code>
    case 'badge':
      return <Badge variant="outline">{label || '—'}</Badge>
    case 'mapped-badge':
      return (
        <Badge variant={column.variants?.[String(rawValue)] || 'outline'}>
          {label || '—'}
        </Badge>
      )
    case 'published':
      return <Badge variant={rawValue ? 'default' : 'secondary'}>{rawValue ? 'Oui' : 'Non'}</Badge>
    case 'icon':
      return <Icon name={String(rawValue || column.fallback || 'FaInfoCircle')} size={16} className="text-accent" />
    case 'icon-tile':
      return (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={String(rawValue || column.fallback || 'FaInfoCircle')} size={16} />
        </span>
      )
    case 'image': {
      if (typeof rawValue !== 'string' || !rawValue) {
        return <ImagePlaceholder />
      }

      const altValue = column.altKey ? item[column.altKey] : undefined
      const alt = typeof altValue === 'string' && altValue ? altValue : column.label || 'Image'
      return <ResourceImage src={rawValue} alt={alt} fit={column.imageFit || 'cover'} />
    }
    case 'date-muted-xs': {
      if (!rawValue) return <span className="text-xs text-muted-foreground">{column.fallback || '—'}</span>
      const date = rawValue instanceof Date ? rawValue : new Date(String(rawValue))
      return Number.isNaN(date.getTime())
        ? <span className="text-xs text-muted-foreground">{column.fallback || '—'}</span>
        : <span className="text-xs text-muted-foreground">{date.toLocaleDateString('fr-FR')}</span>
    }
    case 'link-muted-xs':
      return rawValue
        ? <a href={String(rawValue)} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">{label}</a>
        : <span className="text-xs text-muted-foreground">{column.fallback || '—'}</span>
    case 'service-title': {
      const service = item.service
      if (typeof service !== 'object' || service === null) {
        return <span className="text-muted-foreground">{column.fallback || '—'}</span>
      }
      const related = service as { shortTitle?: unknown; title?: unknown }
      return <span className="text-muted-foreground">{String(related.shortTitle || related.title || column.fallback || '—')}</span>
    }
    default:
      return typeof rawValue === 'boolean' ? (rawValue ? 'Oui' : 'Non') : label
  }
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground">
        <Icon name="FaImage" size={24} />
        <span className="text-xs">Aperçu indisponible</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 90vw, 600px"
      unoptimized
      onError={() => setFailed(true)}
      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
    />
  )
}

export interface ImageFieldProps {
  id: string
  label: string
  value: string
  placeholder?: string
  alt: string
  file: File | null
  onChange: (value: string) => void
  onFileChange: (file: File | null) => void
}

interface ImageMediaItem {
  id: string
  url: string
  alt: string
  filename: string
}

export function ImageField({
  id,
  label,
  value,
  placeholder,
  alt,
  file,
  onChange,
  onFileChange,
}: ImageFieldProps) {
  const [dragOver, setDragOver] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<ImageMediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const previewSrc = file ? localPreview : value

  async function openMediaPicker() {
    setMediaOpen(true)
    setMediaLoading(true)
    try {
      const response = await fetch('/api/admin/media')
      const result = await response.json()
      if (!response.ok) {
        toast.error(result.error || 'Impossible de charger la médiathèque.')
        return
      }
      setMediaItems(
        Array.isArray(result.items)
          ? result.items.filter((item: ImageMediaItem) => item.url)
          : []
      )
    } catch {
      toast.error('Erreur réseau lors du chargement de la médiathèque.')
    } finally {
      setMediaLoading(false)
    }
  }

  function selectFile(selected: File | null) {
    if (!selected) {
      onFileChange(null)
      setLocalPreview(null)
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error('Choisissez une image JPG, PNG ou WebP.')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('La taille maximale de l’image est de 5 Mo.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLocalPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.onerror = () => toast.error('Impossible de prévisualiser cette image.')
    reader.readAsDataURL(selected)
    onChange('')
    onFileChange(selected)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          selectFile(event.dataTransfer.files[0] || null)
        }}
        className={cn(
          'group relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-gradient-to-br from-muted/60 to-background p-3 transition-all duration-300',
          dragOver
            ? 'scale-[1.01] border-accent bg-accent/10 shadow-lg shadow-accent/10'
            : 'border-border hover:border-accent/50 hover:shadow-md'
        )}
      >
        {previewSrc ? (
          <div className="absolute inset-0">
            <ImagePreview key={previewSrc} src={previewSrc} alt={alt || label} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70" />
          </div>
        ) : (
          <div className="pointer-events-none mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
            <Icon name="FaImage" size={22} />
          </div>
        )}
        {file && (
          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            {file.name} · {Math.max(1, Math.round(file.size / 1024))} Ko
          </div>
        )}
        <label
          htmlFor={`${id}-file`}
          className={cn(
            'relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
            previewSrc
              ? 'border-white/30 bg-black/55 text-white hover:bg-black/70'
              : 'border-border bg-background/90 text-foreground hover:border-accent/40 hover:text-accent'
          )}
        >
          <Icon name="FaUpload" size={13} />
          {file ? 'Remplacer l’image' : previewSrc ? 'Changer l’image' : 'Choisir une image'}
          <input
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.[0] || null)}
          />
        </label>
        {!previewSrc && (
          <p className="relative z-10 mt-2 text-center text-xs text-muted-foreground">
            ou glissez-déposez un fichier ici · 5 Mo max.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Input
          id={id}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            if (event.target.value) {
              onFileChange(null)
              setLocalPreview(null)
            }
          }}
          placeholder={placeholder || 'Collez une URL ou téléversez une image ci-dessus'}
        />
        <p className="text-[11px] text-muted-foreground">
          Aperçu instantané. Le fichier choisi sera téléversé lors de l’enregistrement.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={openMediaPicker}
        >
          <Icon name="FaImages" size={13} className="mr-2" />
          Choisir dans la médiathèque
        </Button>
      </div>

      <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choisir une image déjà téléversée</DialogTitle>
          </DialogHeader>
          {mediaLoading ? (
            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : mediaItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune image dans la médiathèque. Téléversez-en une ou choisissez un fichier depuis votre appareil.
            </p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
              {mediaItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.url)
                    onFileChange(null)
                    setLocalPreview(null)
                    setMediaOpen(false)
                  }}
                  className="group overflow-hidden rounded-xl border border-border text-left transition hover:border-accent hover:shadow-md"
                >
                  <span className="relative block aspect-square bg-muted">
                    <Image
                      src={item.url}
                      alt={item.alt || item.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                      className="object-contain p-2 transition-transform group-hover:scale-105"
                    />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">
                    {item.alt || item.filename}
                  </span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="w-full min-w-0">
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
                        {renderColumn(c, item)}
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
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init: Record<string, any> = {}
    for (const f of fields) {
      if (f.type === 'switch') init[f.name] = item[f.name] ?? false
      else if (f.type === 'number') init[f.name] = item[f.name] ?? ''
      else init[f.name] = item[f.name] ?? ''
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(init)
  }, [item, fields])

  function setField(name: string, value: any) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function setImageFile(name: string, file: File | null) {
    setImageFiles((current) => ({ ...current, [name]: file }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...values }
      for (const field of fields.filter((item) => item.type === 'image')) {
        const file = imageFiles[field.name]
        if (file) {
          const form = new FormData()
          form.append('file', file)
          const alt = [
            field.altField ? values[field.altField] : null,
            values.title,
            values.name,
            title,
          ].map((value) => String(value ?? '').trim()).find(Boolean) || field.label
          form.append('alt', alt)

          const response = await fetch('/api/upload', { method: 'POST', body: form })
          const result = await response.json()
          if (!response.ok || !result.item?.url) {
            toast.error(result.error || `Impossible de téléverser ${field.label.toLowerCase()}.`)
            return
          }

          data[field.name] = result.item.url
          setField(field.name, result.item.url)
          setImageFile(field.name, null)
        }

        if (field.required && !String(data[field.name] || '').trim()) {
          toast.error(`Veuillez choisir une image pour « ${field.label} ».`)
          return
        }
      }

      await onSave(data)
    } catch (error) {
      console.error('[resource-manager] image upload failed:', error)
      toast.error('Erreur réseau lors du téléversement de l’image.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        overlayClassName="lg:left-64"
        className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col overflow-hidden p-4 sm:max-h-[calc(100dvh-2rem)] sm:w-[96vw] sm:max-w-[1280px] sm:p-6 lg:left-[calc(16rem+((100vw-16rem)/2))] lg:w-[min(1280px,calc(100vw-18rem))]"
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-5 scroll-thin">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' || f.type === 'image' ? 'min-w-0 space-y-1.5 sm:col-span-2 xl:col-span-3' : 'min-w-0 space-y-1.5'}>
                <Label htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {f.type === 'image' && (
                  <ImageField
                    id={f.name}
                    label={f.label}
                    value={values[f.name] || ''}
                    placeholder={f.placeholder}
                    alt={String((f.altField && values[f.altField]) || values.title || values.name || f.label)}
                    file={imageFiles[f.name] || null}
                    onChange={(value) => setField(f.name, value)}
                    onFileChange={(file) => setImageFile(f.name, file)}
                  />
                )}
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
                    value={values[f.name] ?? ''}
                    onChange={(e) => setField(f.name, e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={f.placeholder}
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
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t border-border pt-4">
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
