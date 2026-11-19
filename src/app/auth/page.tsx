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
  const [remember, setRemember] = useState(false)
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
    <div className="relative flex min-h-screen items-center justify-end overflow-y-auto">
      {/* Login template as FIXED background (doesn't scroll) */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/login-template.webp"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Form panel — positioned in the white box area on the right */}
      <div className="relative z-10 flex min-h-screen w-full max-w-lg items-center justify-center px-4 py-12 md:mr-4 lg:mr-8 xl:mr-12 2xl:mr-16">
        <div className="flex w-full flex-col justify-center">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Icon name="FaLock" size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Espace administration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connectez-vous pour gérer le contenu du site.
            </p>
          </div>

          {/* Form card — transparent on desktop (blends with white panel), semi-opaque on mobile */}
          <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md md:bg-transparent md:shadow-none md:backdrop-blur-none md:p-8 lg:p-10" noValidate>
            {/* Email field with icon */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-primary">
                Email
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="FaEnvelope" size={16} />
                </span>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="admin@dtk.local"
                  aria-invalid={!!errors.email}
                  className="pl-10 h-11 border-border/60 bg-white/80 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Icon name="FaExclamationTriangle" size={10} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field with icon + show/hide */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-primary">
                Mot de passe
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="FaLock" size={16} />
                </span>
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 h-11 border-border/60 bg-white/80 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  <Icon name={showPwd ? 'FaEyeSlash' : 'FaEye'} size={16} />
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Icon name="FaExclamationTriangle" size={10} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                  remember
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border bg-white'
                }`}
                aria-label="Se souvenir de moi"
              >
                {remember && <Icon name="FaCheck" size={10} />}
              </button>
              <span className="text-sm text-muted-foreground cursor-pointer" onClick={() => setRemember(!remember)}>
                Se souvenir de moi
              </span>
            </div>

            {/* Submit button — gradient with icon */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-primary text-white shadow-md hover:shadow-lg hover:from-accent/90 hover:to-primary/90 transition-all"
            >
              {loading ? (
                <>
                  <Icon name="FaCircleNotch" size={16} className="mr-2 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <Icon name="FaSignInAlt" size={16} className="mr-2" />
                  Se connecter
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/80 px-3 text-xs text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Back to site */}
            <Button asChild variant="ghost" className="w-full h-10 text-sm">
              <Link href="/">
                <Icon name="FaArrowLeft" size={14} className="mr-2" />
                Retour au site
              </Link>
            </Button>
          </form>

          {/* Security note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Icon name="FaShieldAlt" size={10} className="inline mr-1" />
            Accès réservé — DTK Corporation SARL
          </p>
        </div>
      </div>
    </div>
  )
}
