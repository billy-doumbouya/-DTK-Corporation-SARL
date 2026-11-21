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
  const welcome =
    settings?.chatbotWelcome ||
    'Bonjour, je suis Aïcha, l’assistante virtuelle de DTK Corporation. Comment puis-je vous aider ?'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcome }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasInteracted = useRef(false)

  // Open the chat after the page settles, unless the visitor has already interacted.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasInteracted.current) setOpen(true)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [])

  function openChat() {
    hasInteracted.current = true
    setOpen(true)
  }

  function closeChat() {
    hasInteracted.current = true
    setOpen(false)
  }

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
      {/* Floating chat button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => { if (open) closeChat(); else openChat() }}
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
          aria-labelledby="chatbot-title"
          aria-modal="false"
          className="fixed bottom-20 left-3 right-3 z-50 flex h-[70dvh] max-h-[calc(100dvh-7rem)] min-h-0 w-auto max-w-none flex-col rounded-xl border border-border bg-card shadow-2xl sm:bottom-24 sm:left-auto sm:right-5 sm:h-[34rem] sm:w-[calc(100vw-2.5rem)] sm:max-w-sm"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-primary px-3 py-2.5 text-primary-foreground sm:px-4 sm:py-3">
            <AssistantAvatar size={32} />
            <div className="min-w-0 flex-1">
              <p id="chatbot-title" className="truncate text-sm font-semibold">Aïcha — Assistante DTK</p>
              <p className="flex items-center gap-1 text-xs text-primary-foreground/70">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                En ligne
              </p>
            </div>
            <button onClick={closeChat} aria-label="Fermer" className="hover:text-accent">
              <Icon name="FaTimes" size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 scroll-thin sm:p-4">
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
            <div className="shrink-0 border-t border-border p-2.5 sm:p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Questions fréquentes :</p>
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(() => sendWithText(q), 50) }}
                    className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium transition-all hover:border-accent hover:bg-accent/10 hover:text-accent sm:px-3"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border p-2.5 sm:p-3">
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
