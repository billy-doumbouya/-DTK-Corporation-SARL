'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssistantAvatar } from '@/components/site/assistant-avatar'
import { cn } from '@/lib/utils'

const QUICK_QUESTIONS = [
  'Quels sont vos services ?',
  'Où intervenez-vous en Guinée ?',
  'Comment demander un devis ?',
  'Quelles formations proposez-vous ?',
  'Comment vous contacter ?',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotSettings {
  chatbotWelcome: string
}

export function ChatbotWidget({ settings }: { settings: ChatbotSettings | null }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const welcome = settings?.chatbotWelcome || 'Bonjour, comment puis-je vous aider ?'

  // First-visit tooltip — shows after 3s if user hasn't seen it (localStorage)
  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem('dtk_chatbot_tooltip_seen')
    if (!seen) {
      const timer = setTimeout(() => setShowTooltip(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismissTooltip() {
    setShowTooltip(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dtk_chatbot_tooltip_seen', '1')
    }
  }

  function openChat() {
    setOpen(true)
    dismissTooltip()
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcome }])
    }
  }, [open, messages.length, welcome])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendWithText(text)
  }

  async function sendWithText(text: string) {
    if (!text.trim() || loading) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      const reply = data.reply || data.error || "Désolé, je n'ai pas pu traiter votre demande. Vous pouvez utiliser le formulaire de contact."
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Une erreur est survenue. N'hésitez pas à utiliser le formulaire de contact." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button + tooltip */}
      <div className="fixed bottom-5 right-5 z-50">
        {showTooltip && !open && (
          <div className="absolute bottom-0 right-16 w-64 animate-fade-in-up rounded-2xl border border-border bg-card p-4 shadow-2xl">
            <div className="absolute bottom-3 -right-2 h-4 w-4 rotate-45 border-b border-r border-border bg-card" />
            <div className="relative">
              <button onClick={dismissTooltip} className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground" aria-label="Fermer">
                <Icon name="FaTimes" size={12} />
              </button>
              <p className="text-sm font-semibold">Besoin d’aide ?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Notre assistante virtuelle est là pour répondre à vos questions sur nos services et activités.
              </p>
              <button onClick={openChat} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                Discuter maintenant
                <Icon name="FaArrowRight" size={10} />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => { if (open) setOpen(false); else openChat() }}
          aria-label={open ? 'Fermer l’assistant' : 'Ouvrir l’assistant virtuel'}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
            'bg-primary text-primary-foreground hover:scale-105',
            open && 'bg-accent'
          )}
        >
          {open ? <Icon name="FaTimes" size={22} /> : <AssistantAvatar size={52} />}
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant virtuel DTK"
          className="fixed bottom-24 right-5 z-50 flex h-[520px] max-h-[80vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col rounded-xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <AssistantAvatar size={36} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Aïcha — Assistante DTK</p>
              <p className="flex items-center gap-1 text-xs text-primary-foreground/70">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                En ligne
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="hover:text-accent">
              <Icon name="FaTimes" size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-accent text-accent-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>·</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick questions — shown when chat just opened with welcome message */}
          {messages.length <= 1 && !loading && (
            <div className="border-t border-border p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Questions fréquentes :</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(() => sendWithText(q), 50) }}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Posez votre question…"
                maxLength={500}
                disabled={loading}
                aria-label="Votre question"
              />
              <Button onClick={send} disabled={loading || !input.trim()} size="icon" aria-label="Envoyer">
                <Icon name="FaPaperPlane" size={16} />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Assistant borné aux activités de DTK Corporation
            </p>
          </div>
        </div>
      )}
    </>
  )
}
