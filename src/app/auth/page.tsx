'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="fixed inset-0 z-[60] isolate h-dvh overflow-y-auto bg-[#eef7fc]">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/login-template.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 flex min-h-full w-full items-center justify-center px-4 py-8 sm:px-8 lg:justify-end lg:px-[5vw]">
        <section className="w-full max-w-[34rem] rounded-[1.75rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(16,27,145,0.18)] backdrop-blur-xl sm:p-9 lg:mr-[1vw] lg:border-white/40 lg:bg-white/75 lg:shadow-none lg:backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 inline-flex rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-primary/5">
              <Image src="/dtk-logo.png" alt="DTK Corporation SARL" width={600} height={295} sizes="100px" className="h-10 w-auto" />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Espace sécurisé
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Administration
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connectez-vous pour gérer les contenus de DTK Corporation.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
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
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="nom@entreprise.com"
                  aria-invalid={!!errors.email}
                  className="h-12 border-border/70 bg-white pl-10 shadow-sm transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Icon name="FaExclamationTriangle" size={10} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
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
                  className="h-12 border-border/70 bg-white pl-10 pr-10 shadow-sm transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
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

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-12 w-full rounded-xl bg-primary text-white shadow-md shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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

            <Button asChild variant="ghost" className="h-10 w-full text-sm text-muted-foreground hover:text-primary">
              <Link href="/">
                <Icon name="FaArrowLeft" size={14} className="mr-2" />
                Retour au site
              </Link>
            </Button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-2 border-t border-primary/10 pt-4 text-xs text-muted-foreground">
            <Icon name="FaShieldAlt" size={12} className="text-accent" />
            Connexion privée · DTK Corporation SARL
          </p>
        </section>
      </div>
    </div>
  )
}
