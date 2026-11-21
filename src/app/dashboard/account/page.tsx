import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { AccountForm } from '@/components/dashboard/account-form'
import { db } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mon compte' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const lastLogin = await db.auditLog.findFirst({
    where: { userId: user.id, action: 'login_success' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="w-full min-w-0">
      <PageHeader title="Mon compte" description="Gérez votre profil et votre mot de passe." />
      <AccountForm user={{ email: user.email, name: user.name, lastLoginAt: lastLogin?.createdAt.toISOString() }} />
    </div>
  )
}
