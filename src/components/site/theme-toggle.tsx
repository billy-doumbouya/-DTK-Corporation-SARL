'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : false

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="text-foreground"
    >
      <Icon name={isDark ? 'FaSun' : 'FaMoon'} size={16} />
      {/* FaSun and FaMoon aren't in the icon map yet, fallback */}
      {!mounted && <Icon name="FaCircleNotch" size={16} />}
    </Button>
  )
}
