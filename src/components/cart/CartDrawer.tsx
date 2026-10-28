'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { mockProducts } from '@/lib/data/products'
import { formatCurrency } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'
import CartItem from './CartItem'

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [cepOpen, setCepOpen] = useState(false)
  const [cep, setCep] = useState('')
  const catalog: Product[] = mockProducts
  const suggestRef = useRef<HTMLDivElement>(null)

  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-cart', handleToggle)
    return () => window.removeEventListener('toggle-cart', handleToggle)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

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
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        data-tone="light"
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border bg-bg transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Carrinho de compras"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink">Sacola</span>
            {mounted && items.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent">
                {items.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fechar carrinho"
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink hover:bg-card-hover"
          >
            ×
          </button>
        </div>

        {/* Barra de frete grátis */}
        <div className="border-b border-border bg-bg-alt px-5 py-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-border-strong">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-500"
              style={{ width: mounted ? `${progress}%` : '0%' }}
            />
          </div>
          <p className="mt-2.5 text-center text-xs text-muted">
            {!mounted || remaining > 0 ? (
              <>Faltam <strong className="text-accent">{mounted ? formatCurrency(remaining) : formatCurrency(FREE_SHIPPING_THRESHOLD)}</strong> para o frete grátis</>
            ) : (
              <strong className="text-accent">Frete grátis desbloqueado!</strong>
            )}
          </p>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
              <div>
                <p className="text-2xl font-semibold text-ink">Sacola vazia</p>
                <p className="mt-1 text-sm text-muted">Que tal começar por uma destas prateleiras?</p>
              </div>
              <div className="w-full space-y-3">
                {SECTIONS.slice(0, 3).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/secao/${s.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="btn-outline w-full"
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
                <div className="mt-2 border-t border-border bg-bg-alt">
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-base font-semibold text-ink">Leva junto</span>
                    <div className="flex gap-2">
                      <button onClick={() => scrollSuggestions('left')} className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-ink hover:border-accent hover:text-accent" aria-label="Anterior">←</button>
                      <button onClick={() => scrollSuggestions('right')} className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-ink hover:border-accent hover:text-accent" aria-label="Próximo">→</button>
                    </div>
                  </div>
                  <div ref={suggestRef} className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-5">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/produto/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group w-[116px] flex-shrink-0"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-card-hover ring-1 ring-border transition-transform group-hover:-translate-y-1">
                          <BookImage src={p.images[0]} title={p.name} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-tight text-ink">{p.name}</p>
                        <p className="text-sm font-semibold text-ink">{formatCurrency(p.price)}</p>
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
          <div className="border-t border-border bg-bg">
            <button
              onClick={() => setCepOpen((v) => !v)}
              className="flex w-full items-center justify-between border-b border-border px-5 py-3.5 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Prazo de entrega</span>
              <span className="text-lg text-ink transition-transform" style={{ transform: cepOpen ? 'rotate(45deg)' : 'none' }} aria-hidden="true">+</span>
            </button>

            {cepOpen && (
              <div className="border-b border-border px-5 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="00000-000"
                    className="flex-1 rounded-full border border-border-strong bg-card px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                  <button className="btn-outline !min-h-[40px] !px-5 !py-2 !text-sm">OK</button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Subtotal</span>
              <span className="text-2xl font-semibold text-ink">{formatCurrency(total)}</span>
            </div>

            <div className="space-y-3 px-5 pb-5">
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full !min-h-[52px]">
                Finalizar compra
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1 text-center text-xs font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
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
