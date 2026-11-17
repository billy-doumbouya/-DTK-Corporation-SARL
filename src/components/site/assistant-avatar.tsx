'use client'

import { useEffect, useState } from 'react'

interface AssistantAvatarProps {
  size?: number
  className?: string
  talking?: boolean
}

/**
 * Animated human assistant avatar — SVG with blinking eyes and subtle float.
 * Replaces the robot icon for a more human, professional feel.
 */
export function AssistantAvatar({ size = 48, className = '', talking = false }: AssistantAvatarProps) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ animation: 'dtk-float 4s ease-in-out infinite' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="avatarSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4C5A3" />
          <stop offset="100%" stopColor="#E0A875" />
        </linearGradient>
        <linearGradient id="avatarHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D1810" />
          <stop offset="100%" stopColor="#1A0F08" />
        </linearGradient>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#08A9E8" />
          <stop offset="100%" stopColor="#101B91" />
        </linearGradient>
        <linearGradient id="avatarCollar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#avatarBg)" />
      {/* Decorative ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />

      {/* Body / shoulders */}
      <path
        d="M20 85 Q20 68 35 62 L65 62 Q80 68 80 85 L80 100 L20 100 Z"
        fill="url(#avatarCollar)"
      />
      {/* Suit collar */}
      <path d="M35 62 L50 72 L65 62 L60 58 L50 65 L40 58 Z" fill="#101B91" opacity="0.8" />

      {/* Neck */}
      <rect x="42" y="55" width="16" height="12" fill="url(#avatarSkin)" />

      {/* Hair back */}
      <path
        d="M25 40 Q25 20 50 20 Q75 20 75 40 L75 55 Q70 50 65 48 L65 35 Q60 30 50 30 Q40 30 35 35 L35 48 Q30 50 25 55 Z"
        fill="url(#avatarHair)"
      />

      {/* Face */}
      <ellipse cx="50" cy="42" rx="16" ry="20" fill="url(#avatarSkin)" />

      {/* Hair front */}
      <path
        d="M34 35 Q36 25 50 24 Q64 25 66 35 Q62 32 58 33 Q55 28 50 28 Q45 28 42 33 Q38 32 34 35 Z"
        fill="url(#avatarHair)"
      />

      {/* Earrings */}
      <circle cx="34" cy="44" r="1.5" fill="#FFD700" />
      <circle cx="66" cy="44" r="1.5" fill="#FFD700" />

      {/* Eyes (blink animation) */}
      {blink ? (
        <>
          <line x1="42" y1="42" x2="48" y2="42" stroke="#1A0F08" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="52" y1="42" x2="58" y2="42" stroke="#1A0F08" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="45" cy="42" rx="2" ry="2.5" fill="#FFFFFF" />
          <circle cx="45" cy="42.5" r="1.5" fill="#2D1810" />
          <ellipse cx="55" cy="42" rx="2" ry="2.5" fill="#FFFFFF" />
          <circle cx="55" cy="42.5" r="1.5" fill="#2D1810" />
        </>
      )}

      {/* Eyebrows */}
      <path d="M41 38 Q45 36 49 38" stroke="#2D1810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M51 38 Q55 36 59 38" stroke="#2D1810" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M50 44 L49 48 L51 48 Z" fill="#D49865" opacity="0.5" />

      {/* Mouth (changes when talking) */}
      {talking ? (
        <ellipse cx="50" cy="52" rx="4" ry="3" fill="#B85042" className="origin-center" style={{ animation: 'dtk-pulse-ring 0.5s ease-in-out infinite' }} />
      ) : (
        <path d="M45 51 Q50 54 55 51" stroke="#B85042" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Blush */}
      <circle cx="38" cy="48" r="3" fill="#E88B7A" opacity="0.3" />
      <circle cx="62" cy="48" r="3" fill="#E88B7A" opacity="0.3" />

      {/* Headset for "assistant" feel */}
      <path d="M30 38 Q30 30 50 28 Q70 30 70 38" stroke="#101B91" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="28" y="38" width="4" height="8" rx="2" fill="#101B91" />
      <rect x="68" y="38" width="4" height="8" rx="2" fill="#101B91" />
      {/* Microphone */}
      <path d="M28 46 Q24 48 24 52" stroke="#101B91" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="52" r="1.5" fill="#08A9E8" />
    </svg>
  )
}
