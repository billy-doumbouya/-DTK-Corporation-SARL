'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none' | 'scale'

interface RevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  className?: string
}

const offset = (dir: Direction, dist: number) => {
  switch (dir) {
    case 'up': return { y: dist }
    case 'down': return { y: -dist }
    case 'left': return { x: dist }
    case 'right': return { x: -dist }
    case 'scale': return { scale: 0.92 }
    default: return {}
  }
}

/**
 * Scroll-triggered reveal animation using Framer Motion's whileInView.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40,
  once = true,
  className,
}: RevealProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger container — children with <RevealItem> animate in sequence.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  direction = 'up',
  distance = 40,
}: {
  children: ReactNode
  className?: string
  direction?: Direction
  distance?: number
}) {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...offset(direction, distance) },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
