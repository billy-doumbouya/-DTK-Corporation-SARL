'use client'

import { useState, useCallback, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  url: string
  alt: string
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      toast.error('Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success('URL copiée.')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  async function deleteMedia(id: string) {
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur.'); return }
      toast.success('Média supprimé.')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Erreur réseau.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Médiathèque</h1>
          <p className="mt-1 text-sm text-muted-foreground">Images téléversées. Cliquez pour copier l’URL.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Icon name="FaUpload" size={14} className="mr-2" />
          Téléverser
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <Icon name="FaImages" size={40} className="mx-auto text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun média. Téléversez votre première image.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-square cursor-pointer" onClick={() => copyUrl(m.url)}>
                { }
                <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all group-hover:bg-primary/40 group-hover:opacity-100">
                  <span className="rounded-md bg-background px-2 py-1 text-xs font-medium">
                    {copiedUrl === m.url ? 'Copié !' : 'Copier l’URL'}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium" title={m.alt}>{m.alt}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{Math.round(m.size / 1024)} Ko</span>
                  <button onClick={() => setDeleteId(m.id)} className="text-destructive hover:text-destructive/80" aria-label="Supprimer">
                    <Icon name="FaTrash" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={load} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
            <AlertDialogDescription>Action irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMedia(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function UploadDialog({ open, onOpenChange, onUploaded }: { open: boolean; onOpenChange: (o: boolean) => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function onSelect(f: File | null) {
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function upload() {
    if (!file || !alt.trim()) {
      toast.error('Sélectionnez un fichier et un texte alternatif.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', alt)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur.')
        return
      }
      toast.success('Image téléversée.')
      setFile(null); setAlt(''); setPreview(null)
      onOpenChange(false)
      onUploaded()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setFile(null); setAlt(''); setPreview(null) } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Téléverser une image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onSelect(e.dataTransfer.files[0]) }}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              dragOver ? 'border-accent bg-accent/5' : 'border-border'
            )}
          >
            {preview ? (
               
              <img src={preview} alt="Aperçu" className="max-h-40 rounded-md object-contain" />
            ) : (
              <>
                <Icon name="FaImage" size={32} className="text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">Glissez-déposez ou</p>
                <label className="mt-1 cursor-pointer text-sm font-medium text-accent hover:underline">
                  choisissez un fichier
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onSelect(e.target.files?.[0] || null)} />
                </label>
              </>
            )}
            {file && <p className="mt-2 text-xs text-muted-foreground">{file.name} ({Math.round(file.size / 1024)} Ko)</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alt">Texte alternatif (obligatoire)</Label>
            <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Décrivez l’image pour l’accessibilité" />
          </div>

          <p className="text-xs text-muted-foreground">Formats acceptés : JPG, PNG, WebP, SVG. Taille max : 5 Mo.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={upload} disabled={uploading || !file || !alt.trim()}>
            {uploading ? <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" /> : <Icon name="FaUpload" size={14} className="mr-2" />}
            Téléverser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
