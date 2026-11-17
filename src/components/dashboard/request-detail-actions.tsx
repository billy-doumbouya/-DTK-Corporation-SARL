'use client'

import { useState } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  archive: 'Archivé',
}

interface Note {
  id: string
  content: string
  createdAt: string
  authorId: string | null
}

export function RequestDetailActions({
  requestId,
  currentStatus,
  notes,
}: {
  requestId: string
  currentStatus: string
  notes: Note[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [noteContent, setNoteContent] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  async function changeStatus(newStatus: string) {
    setChangingStatus(true)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors du changement de statut.')
        return
      }
      setStatus(newStatus)
      toast.success('Statut mis à jour.')
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setChangingStatus(false)
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteContent.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      })
      if (!res.ok) {
        toast.error('Erreur lors de l’ajout de la note.')
        return
      }
      setNoteContent('')
      toast.success('Note ajoutée.')
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status change */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Statut</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={changeStatus} disabled={changingStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {changingStatus && (
            <Icon name="FaCircleNotch" size={16} className="animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Notes internes</h2>
        {notes.length > 0 ? (
          <ul className="mb-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-muted/40 p-3">
                <p className="text-sm">{n.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString('fr-FR')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">Aucune note pour le moment.</p>
        )}
        <form onSubmit={addNote} className="space-y-2">
          <Label htmlFor="note">Ajouter une note</Label>
          <Textarea
            id="note"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Note interne (visible uniquement par les administrateurs)…"
            rows={3}
            disabled={addingNote}
          />
          <Button type="submit" disabled={addingNote || !noteContent.trim()} size="sm">
            {addingNote ? (
              <>
                <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" />
                Ajout…
              </>
            ) : (
              <>
                <Icon name="FaPlus" size={14} className="mr-2" />
                Ajouter
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
