'use client'

import { usePathname } from 'next/navigation'

/**
 * Hides the public site chrome (header, footer, chatbot) on the
 * dashboard and auth routes so those layouts can render their own chrome.
 */
export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) {
    return null
  }
  return <>{children}</>
}
