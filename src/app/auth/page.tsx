'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema } from '@/lib/validators'
import { toast } from 'sonner'

export default function AuthLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      for (const err of parsed.error.issues) {
        const key = err.path[0] as 'email' | 'password'
        fieldErrors[key] = err.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Connexion impossible.')
        return
      }
      toast.success('Connexion réussie.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/auth-bg.webp"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#101B91]/90 via-[#101B91]/70 to-[#08A9E8]/60" />
      </div>
      {/* Login form overlaid */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-card/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            { }
            <img src="/dtk-logo.png" alt="DTK Corporation SARL" className="mx-auto h-12 w-auto" />
            <h1 className="mt-4 text-2xl font-bold">Espace administration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connectez-vous pour gérer le contenu du site.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="admin@dtk.local"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  <Icon name={showPwd ? 'FaEyeSlash' : 'FaEye'} size={16} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Icon name="FaCircleNotch" size={16} className="mr-2 animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  <Icon name="FaLock" size={16} className="mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent">
              <Icon name="FaArrowLeft" size={14} />
              Retour au site
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Accès réservé — DTK Corporation SARL
        </p>
      </div>
    </div>
  )
}
