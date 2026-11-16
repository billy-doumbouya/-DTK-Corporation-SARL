'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const welcome = settings?.chatbotWelcome || 'Bonjour, comment puis-je vous aider ?'

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
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer l’assistant' : 'Ouvrir l’assistant virtuel'}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-primary text-primary-foreground hover:bg-accent hover:scale-105',
          open && 'bg-accent'
        )}
      >
        <Icon name={open ? 'FaTimes' : 'FaRobot'} size={22} />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant virtuel DTK"
          className="fixed bottom-24 right-5 z-50 flex h-[520px] max-h-[80vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col rounded-xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Icon name="FaRobot" size={18} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Assistant DTK</p>
              <p className="text-xs text-primary-foreground/70">En ligne</p>
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
