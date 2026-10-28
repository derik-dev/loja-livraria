'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { mockProducts } from '@/lib/data/products'
import { Product } from '@/lib/types'
import { BRAND_NAME } from '@/lib/brand'
import { BookImage } from '@/components/zine'

interface Message {
  role: 'user' | 'assistant'
  content: string
  productSlugs?: string[]
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Oi! Sou a Vera, sua assistente de leitura. Me conta o que você gosta de ler (ou o que quer dar de presente) que eu indico um livro.',
}

function parseMessage(content: string): { text: string; parts: { type: 'text' | 'slug'; value: string }[] } {
  const parts: { type: 'text' | 'slug'; value: string }[] = []
  const regex = /\[([a-z0-9-]+)\]/g
  let last = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: content.slice(last, match.index) })
    parts.push({ type: 'slug', value: match[1] })
    last = match.index + match[0].length
  }
  if (last < content.length) parts.push({ type: 'text', value: content.slice(last) })

  return { text: content, parts }
}

function ProductCard({ slug, products }: { slug: string; products: Product[] }) {
  const p = products.find((x) => x.slug === slug)
  if (!p) return null
  return (
    <a
      href={`/produto/${p.slug}`}
      className="group mt-2 flex items-center gap-3 rounded-xl border border-border bg-card-hover p-2.5 transition-colors hover:border-accent"
    >
      <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
        <BookImage src={p.images?.[0]} title={p.name} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold leading-tight text-ink group-hover:underline">{p.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      <svg className="ml-auto h-4 w-4 flex-shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const products = mockProducts
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history = messages
      .filter((m) => m.role !== 'assistant' || m.content !== INITIAL_MESSAGE.content)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, products }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, productSlugs: data.productSlugs ?? [] },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, tive um problema. Tente novamente!' },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, products])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Painel de chat */}
      {open && (
        <div data-tone="dark" className="fixed bottom-24 right-4 z-50 flex h-[500px] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-bg shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] sm:w-[380px]">

          {/* Header */}
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-bg-alt px-4 py-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
              <span className="text-base font-semibold">V</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold leading-tight text-ink">Vera</p>
              <p className="text-[11px] text-muted">Assistente da {BRAND_NAME}</p>
            </div>
            <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-card-hover">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => {
              const { parts } = parseMessage(msg.content)
              const isUser = msg.role === 'user'
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${isUser ? '' : 'space-y-1'}`}>
                    <div className={`px-3 py-2 text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-2xl rounded-br-md bg-accent text-on-accent'
                        : 'rounded-2xl rounded-bl-md border border-border bg-card text-ink'
                    }`}>
                      {parts.map((part, j) =>
                        part.type === 'text'
                          ? <span key={j}>{part.value}</span>
                          : null
                      )}
                    </div>
                    {!isUser && msg.productSlugs?.map((slug) => (
                      <ProductCard key={slug} slug={slug} products={products} />
                    ))}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex flex-shrink-0 items-end gap-2 border-t border-border bg-bg-alt px-3 py-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
              }}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre um livro…"
              disabled={loading}
              className="flex-1 resize-none overflow-hidden rounded-2xl border border-border-strong bg-card px-4 py-2 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <svg className="h-4 w-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        data-tone="dark"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-bg text-ink shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)] transition-transform hover:-translate-y-1"
        aria-label="Abrir chat"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </>
  )
}
