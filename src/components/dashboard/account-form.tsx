'use client'

import { useState } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { passwordChangeSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export function AccountForm({ user }: { user: { email: string; name: string | null; lastLoginAt?: string | null } }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = passwordChangeSchema.safeParse({ currentPassword, newPassword, confirm })
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      for (const err of parsed.error.issues) {
        const key = err.path[0] as string
        fe[key] = err.message
      }
      setErrors(fe)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirm }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur.')
        return
      }
      toast.success('Mot de passe modifié avec succès.')
      setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile info */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Icon name="FaUser" size={16} className="text-accent" />
          Profil
        </h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nom</dt>
            <dd className="font-medium">{user.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dernière connexion</dt>
            <dd className="font-medium">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR') : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Password change */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Icon name="FaLock" size={16} className="text-accent" />
          Changer le mot de passe
        </h2>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
            <p className="text-xs text-muted-foreground">Min. 8 caractères, une lettre et un chiffre.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmer</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Icon name="FaCircleNotch" size={14} className="mr-2 animate-spin" /> : <Icon name="FaSave" size={14} className="mr-2" />}
            Modifier
          </Button>
        </form>
      </div>
    </div>
  )
}
