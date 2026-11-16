import { PageHeader } from '@/components/dashboard/page-header'
import { ChatbotConfig } from '@/components/dashboard/chatbot-config'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chatbot' }
export const dynamic = 'force-dynamic'

export default function ChatbotAdminPage() {
  return (
    <div>
      <PageHeader title="Configuration du chatbot" description="Modèles, base de connaissances (RAG) et paramètres." />
      <ChatbotConfig />
    </div>
  )
}
