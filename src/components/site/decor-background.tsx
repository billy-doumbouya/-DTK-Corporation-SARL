/**
 * Decorative background components — SVG patterns, mesh gradients, geometric shapes.
 * Inspired by the ellipse motif of the DTK logo.
 * All purely decorative (aria-hidden, pointer-events-none).
 */

interface DecorProps {
  className?: string
}

/**
 * Mesh gradient background — soft blurred blobs in DTK cyan + navy.
 */
export function MeshBackground({ className = '' }: DecorProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#08A9E8] opacity-[0.12] blur-[100px]" />
      <div className="absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#101B91] opacity-[0.10] blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#08A9E8] opacity-[0.08] blur-[90px]" />
    </div>
  )
}

/**
 * Dot grid pattern — subtle, professional.
 */
export function DotGrid({ className = '' }: DecorProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 27, 145, 0.07) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }}
    />
  )
}

/**
 * Line grid pattern — architectural feel for BTP.
 */
export function LineGrid({ className = '' }: DecorProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage:
          'linear-gradient(rgba(16, 27, 145, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 27, 145, 0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  )
}

/**
 * SVG wave / curve divider — inspired by logo ellipse.
 * Placed at bottom of a section, cyan gradient.
 */
export function WaveDivider({ className = '', color = 'var(--background)' }: DecorProps & { color?: string }) {
  return (
    <div className={`pointer-events-none absolute bottom-0 left-0 right-0 leading-[0] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="h-[60px] w-full md:h-[100px]"
        fill={color}
      >
        <path d="M0,60 C240,100 480,20 720,50 C960,80 1200,110 1440,60 L1440,120 L0,120 Z" />
      </svg>
    </div>
  )
}

/**
 * Floating geometric shapes — ellipses + circles, very subtle.
 */
export function FloatingShapes({ className = '' }: DecorProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute top-10 right-[8%] h-24 w-24 opacity-[0.06]" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="48" ry="38" fill="none" stroke="#101B91" strokeWidth="1.5" />
        <ellipse cx="50" cy="50" rx="34" ry="26" fill="none" stroke="#08A9E8" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-20 left-[6%] h-32 w-32 opacity-[0.05]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#08A9E8" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <svg className="absolute top-1/2 left-1/3 h-16 w-16 opacity-[0.04]" viewBox="0 0 100 100">
        <path d="M50 5 L95 80 L5 80 Z" fill="none" stroke="#101B91" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

/**
 * Diagonal path lines — the "path/CSV graphic" effect requested.
 * Thin cyan/navy lines crossing diagonally, very subtle.
 */
export function PathLines({ className = '' }: DecorProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" preserveAspectRatio="none">
        <defs>
          <pattern id="pathLines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 200 L200 0" stroke="#08A9E8" strokeWidth="0.8" fill="none" />
            <path d="M50 200 L200 50" stroke="#101B91" strokeWidth="0.6" fill="none" />
            <circle cx="150" cy="50" r="2" fill="#08A9E8" />
            <circle cx="50" cy="150" r="2" fill="#101B91" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pathLines)" />
      </svg>
    </div>
  )
}

/**
 * Full decorative combo: mesh + dot grid + floating shapes.
 * Use on large content sections.
 */
export function RichBackground({ className = '' }: DecorProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <MeshBackground />
      <DotGrid />
      <FloatingShapes />
    </div>
  )
}

/**
 * Hero-specific background: mesh + path lines + large ellipse ring.
 * For full-screen hero sections.
 */
export function HeroDecor({ className = '' }: DecorProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -top-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-[#08A9E8] opacity-[0.15] blur-[120px]" />
      <div className="absolute -bottom-32 -left-20 h-[26rem] w-[26rem] rounded-full bg-[#101B91] opacity-[0.12] blur-[110px]" />
      <svg className="absolute top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]" viewBox="0 0 200 200">
        <ellipse cx="100" cy="100" rx="90" ry="72" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        <ellipse cx="100" cy="100" rx="70" ry="55" fill="none" stroke="#08A9E8" strokeWidth="0.8" />
        <ellipse cx="100" cy="100" rx="50" ry="38" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
