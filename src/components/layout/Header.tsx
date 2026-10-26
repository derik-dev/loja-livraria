'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'
import { BookImage } from '@/components/zine'
import MobileMenu from './MobileMenu'

// `overlay` e `sticky` eram do cabeçalho transparente antigo; o atual é sempre sólido.
interface HeaderProps {
  overlay?: boolean
  sticky?: boolean
}

const navLink = 'whitespace-nowrap text-[13px] text-white/90 transition-colors hover:text-[var(--bk-gold-light)]'

export default function Header(props: HeaderProps) {
  void props
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [catOpen, setCatOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemCount = useCartStore((s) => s.itemCount())
  const { user, signOut, openAuthModal } = useAuth()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); return }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(6)
      if (!error && data) setSearchResults(data.map(mapProduct))
    }, 250)

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [searchQuery])

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/produtos?q=${encodeURIComponent(q)}`)
    setSearchFocused(false)
    setSearchQuery('')
  }

  function openCat() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setCatOpen(true)
  }
  function closeCatSoon() {
    closeTimer.current = setTimeout(() => setCatOpen(false), 120)
  }

  const showResults = searchFocused && searchResults.length > 0
  const userName = (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ?? user?.email?.split('@')[0]

  const searchBox = (
    <div className="relative w-full">
      <form onSubmit={submitSearch} role="search" className="flex h-11 w-full overflow-hidden rounded-md bg-white shadow-sm">
        <label htmlFor="header-search" className="sr-only">Buscar no catálogo</label>
        <input
          id="header-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          placeholder="Buscar livros, autores e assuntos…"
          autoComplete="off"
          className="min-w-0 flex-1 px-4 text-[15px] text-[var(--bk-ink)]"
          style={{ border: 0, boxShadow: 'none', borderRadius: 0, background: 'transparent' }}
        />
        <button type="submit" aria-label="Buscar" className="flex w-12 items-center justify-center border-l border-[var(--bk-line)] text-[var(--bk-ink-soft)] transition-colors hover:text-[var(--bk-navy)]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </form>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md bg-white shadow-[0_12px_32px_-8px_rgb(13_28_54/0.45)]">
          <ul>
            {searchResults.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/produto/${p.slug}`}
                  onClick={() => { setSearchFocused(false); setSearchQuery('') }}
                  className="flex items-center gap-3 border-b border-[var(--bk-paper-2)] px-4 py-2.5 transition-colors hover:bg-[var(--bk-paper)]"
                >
                  <div className="bk-cover h-14 w-10 flex-shrink-0 overflow-hidden">
                    <BookImage src={p.images[0]} title={p.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--bk-ink)]">{p.name}</p>
                    <p className="text-sm">
                      <span className="font-semibold">{formatCurrency(p.price)}</span>
                      {p.originalPrice && <span className="ml-2 text-xs text-zinc-400 line-through">{formatCurrency(p.originalPrice)}</span>}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onMouseDown={(e) => { e.preventDefault(); submitSearch() }}
            className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--bk-navy-2)] hover:bg-[var(--bk-paper)]"
          >
            Ver todos os resultados para &ldquo;{searchQuery}&rdquo;
          </button>
        </div>
      )}
    </div>
  )

  const cartButton = (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart'))}
      aria-label="Carrinho de compras"
      className="relative flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[var(--bk-gold-light)]"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {mounted && itemCount > 0 && (
        <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--bk-gold)] px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bk-navy)] text-white shadow-[0_2px_8px_rgb(13_28_54/0.35)]">
        {/* ── MOBILE ── */}
        <div className="px-3 pb-3 pt-2 md:hidden">
          <div className="flex h-11 items-center justify-between">
            <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7h16.5M3.75 12h16.5M3.75 17h16.5" />
              </svg>
            </button>
            <Link href="/" aria-label="Página inicial">
              <BrandLogo variant="light" textClassName="text-[1.35rem]" />
            </Link>
            {cartButton}
          </div>
          <div className="mt-1.5">{searchBox}</div>
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden md:block">
          <div className="mx-auto grid max-w-[1200px] grid-cols-[auto_1fr_auto] items-center gap-8 px-4 pb-2 pt-3.5">
            <Link href="/" aria-label="Página inicial">
              <BrandLogo variant="light" textClassName="text-[1.7rem]" />
            </Link>
            {searchBox}
            <p className="hidden text-[13px] leading-tight text-white/80 lg:block">
              <span className="font-semibold text-[var(--bk-gold-light)]">Frete grátis</span>
              <br />
              acima de {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </p>
          </div>

          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 pb-2.5">
            <nav className="flex items-center gap-6" aria-label="Seções do catálogo">
              <div className="relative" onMouseEnter={openCat} onMouseLeave={closeCatSoon}>
                <button
                  className={`${navLink} flex items-center gap-1`}
                  aria-expanded={catOpen}
                  onClick={() => setCatOpen((v) => !v)}
                >
                  Categorias
                  <svg className={`h-3 w-3 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {catOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2.5 w-64 overflow-hidden rounded-md bg-white py-2 text-[var(--bk-ink)] shadow-[0_12px_32px_-8px_rgb(13_28_54/0.5)]">
                    {SECTIONS.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/secao/${s.slug}`}
                        onClick={() => setCatOpen(false)}
                        className="block px-5 py-2.5 text-sm transition-colors hover:bg-[var(--bk-paper)] hover:text-[var(--bk-navy-2)]"
                      >
                        {s.label}
                      </Link>
                    ))}
                    <Link
                      href="/produtos"
                      onClick={() => setCatOpen(false)}
                      className="mt-1 block border-t border-[var(--bk-paper-2)] px-5 py-2.5 text-sm font-semibold text-[var(--bk-navy-2)] hover:bg-[var(--bk-paper)]"
                    >
                      Ver todo o catálogo
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/produtos" className={navLink}>Catálogo</Link>
              <Link href="/secao/novidades" className={navLink}>Novidades</Link>
              <Link href="/secao/masculino" className={navLink}>Ficção</Link>
              <Link href="/secao/feminino" className={navLink}>Não-ficção</Link>
              <Link href="/secao/inverno" className={navLink}>Clássicos</Link>
            </nav>

            <div className="flex items-center gap-5">
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen((v) => !v)} className={`${navLink} flex items-center gap-1`} aria-expanded={userMenuOpen}>
                    Olá, {userName}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2.5 w-48 overflow-hidden rounded-md bg-white py-2 text-[var(--bk-ink)] shadow-[0_12px_32px_-8px_rgb(13_28_54/0.5)]">
                      <Link href="/conta" onClick={() => setUserMenuOpen(false)} className="block px-5 py-2.5 text-sm hover:bg-[var(--bk-paper)]">Minhas compras</Link>
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }} className="block w-full px-5 py-2.5 text-left text-sm hover:bg-[var(--bk-paper)]">Sair</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={openAuthModal} className={navLink}>Crie a sua conta</button>
                  <button onClick={openAuthModal} className={navLink}>Entre</button>
                </>
              )}
              <Link href="/conta" className={navLink}>Compras</Link>
              {cartButton}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
