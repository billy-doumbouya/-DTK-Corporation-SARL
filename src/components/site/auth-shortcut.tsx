'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Keyboard shortcut to access the hidden login route.
 * Ctrl+Shift+L or Alt+Shift+A → /auth
 * Discreet alternative to "5 clicks on logo" — more reliable on mobile too.
 */
export function AuthShortcut() {
  const router = useRouter()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl+Shift+L
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault()
        router.push('/auth')
        return
      }
      // Alt+Shift+A
      if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        router.push('/auth')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])
  return null
}
