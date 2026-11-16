import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — DTK Corporation',
  description: 'Espace administration.',
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
