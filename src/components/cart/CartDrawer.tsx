'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'
import CartItem from './CartItem'

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cepOpen, setCepOpen] = useState(false)
  const [cep, setCep] = useState('')
  const [catalog, setCatalog] = useState<Product[]>([])
  const suggestRef = useRef<HTMLDivElement>(null)

  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-cart', handleToggle)
    return () => window.removeEventListener('toggle-cart', handleToggle)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Sugestões: carrega uma vez, na primeira vez que o carrinho abre
  useEffect(() => {
    if (!isOpen || catalog.length > 0) return
    supabase.from('products').select('*').limit(12).then(({ data }) => {
      if (data) setCatalog(data.map(mapProduct))
    })
  }, [isOpen, catalog.length])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  const cartIds = new Set(items.map((i) => i.product.id))
  const suggestions = catalog.filter((p) => !cartIds.has(p.id)).slice(0, 6)

  const scrollSuggestions = (dir: 'left' | 'right') => {
    suggestRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' })
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[var(--z-ink)]/60"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l-[3px] border-[var(--z-ink)] bg-[var(--z-paper)] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Carrinho de compras"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-[3px] border-[var(--z-ink)] bg-[var(--z-yellow)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="z-display text-3xl">Sacola</span>
            {mounted && items.length > 0 && (
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border-[2.5px] border-[var(--z-ink)] bg-[var(--z-red)] px-1.5 text-xs font-bold text-[#fff9ea]">
                {items.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fechar carrinho"
            className="flex h-10 w-10 items-center justify-center border-[2.5px] border-[var(--z-ink)] bg-[#fffdf6] text-xl font-bold hover:bg-[var(--z-pink)]"
          >
            ×
          </button>
        </div>

        {/* Barra de frete grátis */}
        <div className="border-b-[3px] border-[var(--z-ink)] bg-[#fffdf6] px-5 py-4">
          <div className="relative h-4 border-[2.5px] border-[var(--z-ink)] bg-[var(--z-paper-2)]">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--z-red)] transition-all duration-500"
              style={{ width: mounted ? `${progress}%` : '0%' }}
            />
            <div className="z-lines pointer-events-none absolute inset-0" />
          </div>
          <p className="mt-2.5 text-center text-xs font-bold">
            {!mounted || remaining > 0 ? (
              <>Faltam <span className="z-mark">{mounted ? formatCurrency(remaining) : formatCurrency(FREE_SHIPPING_THRESHOLD)}</span> pro frete grátis</>
            ) : (
              <span className="text-[var(--z-red)]">✶ Frete grátis desbloqueado! ✶</span>
            )}
          </p>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
              <div className="z-card -rotate-2 bg-[var(--z-pink)] px-7 py-5">
                <p className="z-display text-3xl">Sacola vazia</p>
                <p className="z-hand text-2xl">cadê os livros?</p>
              </div>
              <p className="text-sm font-medium">Que tal começar por uma destas prateleiras?</p>
              <div className="w-full space-y-3">
                {SECTIONS.slice(0, 3).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/secao/${s.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="z-btn z-btn--paper w-full"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 pt-1">
                {items.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-2 border-t-[3px] border-[var(--z-ink)] bg-[var(--z-lilac)]">
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="z-display text-lg">Leva junto</span>
                    <div className="flex gap-2">
                      <button onClick={() => scrollSuggestions('left')} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--z-ink)] bg-[var(--z-paper)] font-bold" aria-label="Anterior">←</button>
                      <button onClick={() => scrollSuggestions('right')} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--z-ink)] bg-[var(--z-paper)] font-bold" aria-label="Próximo">→</button>
                    </div>
                  </div>
                  <div ref={suggestRef} className="z-noscroll flex gap-4 overflow-x-auto px-5 pb-5">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/produto/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group w-[116px] flex-shrink-0"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden border-[3px] border-[var(--z-ink)] bg-[var(--z-paper-2)] shadow-[4px_4px_0_var(--z-ink)] transition-transform group-hover:-translate-y-1">
                          <BookImage src={p.images[0]} title={p.name} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-tight">{p.name}</p>
                        <p className="z-display text-sm">{formatCurrency(p.price)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé */}
        {items.length > 0 && (
          <div className="border-t-[3px] border-[var(--z-ink)] bg-[var(--z-paper)]">
            <button
              onClick={() => setCepOpen((v) => !v)}
              className="flex w-full items-center justify-between border-b-2 border-dashed border-[var(--z-ink)]/40 px-5 py-3.5 text-left"
            >
              <span className="text-xs font-bold uppercase tracking-[0.12em]">Prazo de entrega</span>
              <span className="text-lg font-bold transition-transform" style={{ transform: cepOpen ? 'rotate(45deg)' : 'none' }} aria-hidden="true">+</span>
            </button>

            {cepOpen && (
              <div className="border-b-2 border-dashed border-[var(--z-ink)]/40 px-5 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="00000-000"
                    className="flex-1 px-3 py-2 text-xs"
                  />
                  <button className="z-btn z-btn--ink !px-4 !py-2 !text-xs">OK</button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em]">Subtotal</span>
              <span className="z-display text-2xl">{formatCurrency(total)}</span>
            </div>

            <div className="space-y-3 px-5 pb-5">
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="z-btn z-btn--red w-full !py-4 !text-base">
                Finalizar compra →
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1 text-center text-xs font-bold underline underline-offset-4 hover:text-[var(--z-red)]"
              >
                Continuar olhando livros
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
