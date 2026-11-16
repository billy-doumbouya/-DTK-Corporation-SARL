'use client'

/**
 * Global error boundary — catches errors in the ROOT layout itself.
 * This is the last line of defense: if layout.tsx throws, this renders.
 * Must include its own <html> and <body> since it replaces the entire document.
 */
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
     
    console.error('[global-error]', error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#101B91',
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              marginBottom: '1rem',
              fontSize: '28px',
            }}
          >
            ⚠
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Erreur critique
          </h1>
          <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
            Une erreur inattendue est survenue au niveau de l’application.
            Notre équipe a été informée. Vous pouvez réessayer ou revenir à l’accueil.
          </p>
          {error.digest && (
            <p style={{ opacity: 0.5, fontSize: '0.75rem', margin: '0.5rem 0' }}>
              Référence : {error.digest}
            </p>
          )}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: '#08A9E8',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Retour à l’accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
