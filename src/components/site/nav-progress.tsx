'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Slim navigation progress bar shown on route changes.
 * Replaces NProgress with native App Router events + a tiny CSS bar.
 */
export function NavProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState('0%')

  useEffect(() => {
    let raf1: number
    let raf2: number
    let timeout: number
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
     
    setWidth('0%')
    // animate to ~80% quickly
    raf1 = requestAnimationFrame(() => setWidth('30%'))
    raf2 = requestAnimationFrame(() => setWidth('70%'))
    // complete after a short delay (page loaded)
    timeout = window.setTimeout(() => {
      setWidth('100%')
      window.setTimeout(() => setVisible(false), 300)
    }, 400)
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(timeout)
    }
  }, [pathname])

  if (!visible) return null
  return (
    <div
      className="nav-progress"
      style={{ width, opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    />
  )
}
