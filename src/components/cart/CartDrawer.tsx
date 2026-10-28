'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/context/AuthContext'
import { mockProducts } from '@/lib/data/products'
import { formatCurrency } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import { siteConfig } from '@/site.config'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'
import CartItem from './CartItem'

type JustAdded = { product: Product; quantity: number }

/**
 * Sacola lateral. Abre sozinha quando alguém coloca um livro na sacola (evento `cart-added`, disparado pelo
 * cartStore), confirma o que foi adicionado, mostra sugestões e as informações importantes da compra.
 */
export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<JustAdded | null>(null)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [cepOpen, setCepOpen] = useState(false)
  const [cep, setCep] = useState('')
  const catalog: Product[] = mockProducts
  const suggestRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const addItem = useCartStore((s) => s.addItem)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleToggle = () => {
      setJustAdded(null)
      setIsOpen((prev) => !prev)
    }
    const handleAdded = (e: Event) => {
      const detail = (e as CustomEvent<JustAdded>).detail
      if (detail?.product) setJustAdded(detail)
      setIsOpen(true)
    }
    window.addEventListener('toggle-cart', handleToggle)
    window.addEventListener('cart-added', handleAdded)
    return () => {
      window.removeEventListener('toggle-cart', handleToggle)
      window.removeEventListener('cart-added', handleAdded)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (!isOpen) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  function close() {
    setIsOpen(false)
    setJustAdded(null)
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  // Sugestões: primeiro o mesmo gênero do livro adicionado, depois o resto; nunca o que já está na sacola.
  const cartIds = new Set(items.map((i) => i.product.id))
  const reference = justAdded?.product ?? items[items.length - 1]?.product
  const pool = catalog.filter((p) => !cartIds.has(p.id))
  const suggestions = [
    ...pool.filter((p) => reference && p.category === reference.category),
    ...pool.filter((p) => !reference || p.category !== reference.category),
  ].slice(0, 6)

  const scrollSuggestions = (dir: 'left' | 'right') => {
    suggestRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const quickAdd = (p: Product) => {
    if (!user) {
      close()
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }
    addItem(p)
  }

  return (
    <>
      {isOpen && <div data-lenis-prevent className="fixed inset-0 z-50 bg-black/60" onClick={close} aria-hidden="true" />}

      <div
        data-tone="light"
        data-lenis-prevent
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label="Sacola de compras"
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-border bg-bg transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'invisible translate-x-full',
        ].join(' ')}
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
          <button ref={closeRef} onClick={close} aria-label="Fechar sacola" className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink hover:bg-card-hover">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Confirmação do que acabou de entrar */}
          {justAdded && (
            <div role="status" className="border-b border-border bg-card-hover px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                Adicionado à sacola
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="relative block aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-sm bg-card ring-1 ring-border">
                  <BookImage src={justAdded.product.images[0]} title={justAdded.product.name} sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-semibold leading-snug text-ink">{justAdded.product.name}</span>
                  {justAdded.product.author && <span className="block truncate text-xs text-muted">{justAdded.product.author}</span>}
                </span>
                <span className="shrink-0 text-right text-sm font-semibold text-ink">
                  {justAdded.quantity > 1 && <span className="block text-xs font-normal text-muted">{justAdded.quantity}x</span>}
                  {formatCurrency(justAdded.product.price * justAdded.quantity)}
                </span>
              </div>
            </div>
          )}

          {/* Barra de frete grátis */}
          {items.length > 0 && (
            <div className="border-b border-border bg-bg-alt px-5 py-4">
              <div className="relative h-2 overflow-hidden rounded-full bg-border-strong">
                <div className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-500" style={{ width: mounted ? `${progress}%` : '0%' }} />
              </div>
              <p className="mt-2.5 text-center text-xs text-muted">
                {!mounted || remaining > 0 ? (
                  <>Faltam <strong className="text-accent">{mounted ? formatCurrency(remaining) : formatCurrency(FREE_SHIPPING_THRESHOLD)}</strong> para o frete grátis</>
                ) : (
                  <strong className="text-accent">Frete grátis desbloqueado!</strong>
                )}
              </p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-6 px-6 py-10 text-center">
              <div>
                <p className="text-2xl font-semibold text-ink">Sacola vazia</p>
                <p className="mt-1 text-sm text-muted">Que tal começar por uma destas prateleiras?</p>
              </div>
              <div className="w-full space-y-3">
                {SECTIONS.slice(0, 3).map((s) => (
                  <Link key={s.slug} href={`/secao/${s.slug}`} onClick={close} className="btn-outline w-full">{s.label}</Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-5 pt-1">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div className="mt-2 border-t border-border bg-bg-alt">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-base font-semibold text-ink">{justAdded ? 'Quem levou esse também levou' : 'Leva junto'}</span>
                <div className="flex gap-2">
                  <button onClick={() => scrollSuggestions('left')} className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-ink hover:border-accent hover:text-accent" aria-label="Anterior">←</button>
                  <button onClick={() => scrollSuggestions('right')} className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-ink hover:border-accent hover:text-accent" aria-label="Próximo">→</button>
                </div>
              </div>
              <div ref={suggestRef} className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-5">
                {suggestions.map((p) => (
                  <div key={p.id} className="w-[124px] shrink-0">
                    <Link href={`/produto/${p.slug}`} onClick={close} className="group block">
                      <span className="relative block aspect-[2/3] w-full overflow-hidden rounded-sm bg-card-hover ring-1 ring-border transition-transform group-hover:-translate-y-1">
                        <BookImage src={p.images[0]} title={p.name} sizes="124px" />
                      </span>
                      <span className="mt-2 line-clamp-2 block text-[12px] font-medium leading-tight text-ink">{p.name}</span>
                    </Link>
                    <span className="mt-0.5 block text-sm font-semibold text-ink">{formatCurrency(p.price)}</span>
                    <button type="button" onClick={() => quickAdd(p)} className="btn-outline mt-2 w-full !min-h-[34px] !px-2 !py-1 !text-xs">Adicionar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações importantes */}
          <div className="border-t border-border px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Sobre a sua compra</p>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {siteConfig.benefits.map((b) => (
                <li key={b.title} className="rounded-xl border border-border bg-card p-3">
                  <span className="block text-sm font-semibold text-ink">{b.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé */}
        {items.length > 0 && (
          <div className="border-t border-border bg-bg">
            <button onClick={() => setCepOpen((v) => !v)} className="flex w-full items-center justify-between border-b border-border px-5 py-3.5 text-left">
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

            <div className="space-y-2.5 px-5 pb-5">
              <Link href="/checkout" onClick={close} className="btn-primary w-full !min-h-[52px]">Finalizar compra</Link>
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/carrinho" onClick={close} className="btn-outline w-full !min-h-[44px] !text-sm">Ver sacola</Link>
                <button onClick={close} className="btn-outline w-full !min-h-[44px] !text-sm">Continuar comprando</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
