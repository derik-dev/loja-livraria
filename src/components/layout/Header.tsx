'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { searchMockProducts } from '@/lib/data/products'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'
import { BookImage } from '@/components/zine'
import MobileMenu from './MobileMenu'
import AnnouncementBar from './AnnouncementBar'
import { siteConfig } from '@/site.config'

// `overlay` e `sticky` eram do cabeçalho transparente antigo; o atual é sempre sólido.
interface HeaderProps {
  overlay?: boolean
  /** Mesmo visual da home, mas no fluxo da página e com fundo sólido (páginas internas). */
  flow?: boolean
  sticky?: boolean
}

// Links úteis do header (destinos em src/site.config.ts).
const UTILITY_LINKS = [
  { label: 'Rastrear pedido', href: siteConfig.links.track },
  { label: 'Ajuda', href: siteConfig.links.help },
  { label: 'Loja física', href: siteConfig.links.store },
]

const textLink = 'whitespace-nowrap text-sm text-muted transition-colors hover:text-ink'

export default function Header({ overlay: overlayProp = false, flow = false }: HeaderProps) {
  const overlay = overlayProp || flow
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const { user, signOut } = useAuth()
  const router = useRouter()

  // false no servidor e na hidratação, true depois: evita divergência do contador do carrinho (localStorage)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const searchResults = useMemo(() => searchMockProducts(searchQuery), [searchQuery])

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/produtos?q=${encodeURIComponent(q)}`)
    setSearchFocused(false)
    setSearchQuery('')
  }

  const showResults = searchFocused && searchResults.length > 0
  const userName = (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ?? user?.email?.split('@')[0]

  const searchBox = (
    <div className="relative w-full">
      <form onSubmit={submitSearch} role="search" className={`flex h-12 w-full overflow-hidden rounded-full border transition-colors focus-within:border-accent ${overlay ? 'border-[#fff8ef]/50 bg-[#24150d]/50' : 'border-border-strong rounded-xl bg-card'}`}>
        <label htmlFor="header-search" className="sr-only">Buscar no catálogo</label>
        <input
          id="header-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          placeholder="Buscar livros e autores…"
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent px-4 text-[15px] ${overlay ? 'text-[#fff8ef] placeholder:text-[#fff8ef]/75' : 'text-ink placeholder:text-muted'}`}
          style={{ border: 0, boxShadow: 'none', borderRadius: 0, background: 'transparent' }}
        />
        <button type="submit" aria-label="Buscar" className={`flex w-12 items-center justify-center transition-colors hover:text-accent ${overlay ? 'text-[#fff8ef]' : 'text-muted'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </form>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card-hover">
          <ul>
            {searchResults.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/produto/${p.slug}`}
                  onClick={() => { setSearchFocused(false); setSearchQuery('') }}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-card"
                >
                  <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded">
                    <BookImage src={p.images[0]} title={p.name} sizes="40px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    {p.author && <p className="truncate text-xs text-muted">{p.author}</p>}
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatCurrency(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onMouseDown={(e) => { e.preventDefault(); submitSearch() }}
            className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium text-accent hover:bg-card"
          >
            Ver todos os resultados para &ldquo;{searchQuery}&rdquo;
          </button>
        </div>
      )}
    </div>
  )

  const cartButton = (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart'))}
      aria-label="Abrir sacola"
      className={`relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-card-hover ${overlay ? 'text-[#fff8ef]' : 'text-ink'}`}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={overlay ? 'M2.5 4h3l2.6 13.3a2 2 0 002 1.6h10.7a2 2 0 002-1.6L25 9H7m4 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z' : 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z'} />
      </svg>
      {mounted && itemCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )

  const categoryRow = (
    <nav aria-label="Categorias" className="no-scrollbar -mx-5 flex gap-6 overflow-x-auto px-5 md:mx-0 md:px-0">
      <Link href="/produtos" className={textLink}>Todo o catálogo</Link>
      {SECTIONS.map((s) => (
        <Link key={s.slug} href={`/secao/${s.slug}`} className={textLink}>{s.label}</Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Faixa de confiança + header ficam no topo da página (rolam junto com ela), sempre escuros e opacos */}
      <div data-tone="dark" className={flow ? 'home-header home-header-flow relative z-40' : overlay ? 'home-header absolute inset-x-0 top-0 z-40' : 'relative z-40'}>
      {/* 1. Barra de aviso (marquee) */}
      <AnnouncementBar />

      {/* 2. Header */}
      <header className={`w-full border-b border-border ${overlay ? 'home-header-nav' : 'bg-bg'}`}>
        {/* mobile */}
        <div className="container-page pb-3 pt-2 md:hidden">
          <div className="flex h-12 items-center justify-between">
            <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-card-hover">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7h16.5M3.75 12h16.5M3.75 17h16.5" />
              </svg>
            </button>
            <Link href="/" aria-label="Papelada, página inicial">
              <BrandLogo variant={overlay ? 'light' : 'dark'} textClassName="text-[1.3rem]" />
            </Link>
            {cartButton}
          </div>
          <div className="mt-1.5">{searchBox}</div>
          <div className="mt-3">{categoryRow}</div>
        </div>

        {/* desktop */}
        <div className="container-page hidden md:block">
          {/* Links úteis: faixa fina acima do menu, alinhada à direita do container */}
          <nav aria-label="Links úteis" className="flex justify-end gap-6 pt-2.5">
            {UTILITY_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="whitespace-nowrap text-sm font-medium text-[#fff8ef] transition-colors hover:text-tan">{link.label}</Link>
            ))}
          </nav>
          <div className={`items-center pb-4 pt-1 ${overlay ? 'grid grid-cols-[auto_auto_minmax(220px,1fr)_auto] gap-5 xl:gap-7' : 'grid grid-cols-[auto_1fr_auto] gap-8'}`}>
            <Link href="/" aria-label="Papelada, página inicial">
              <BrandLogo variant={overlay ? 'light' : 'dark'} textClassName="text-[1.7rem]" />
            </Link>
            {overlay && (
              <nav aria-label="Navegação principal" className="hidden items-center gap-5 xl:flex xl:gap-6">
                <Link href="/produtos" className="text-sm text-[#fff8ef] transition-colors hover:text-accent">Livros⌄</Link>
                <Link href="/produtos?autor=" className="text-sm text-[#fff8ef] transition-colors hover:text-accent">Autores</Link>
                <Link href="/produtos?ordem=mais-vendidos" className="whitespace-nowrap text-sm text-[#fff8ef] transition-colors hover:text-accent">Mais vendidos</Link>
                <Link href="/secao/novidades" className="text-sm text-[#fff8ef] transition-colors hover:text-accent">Lançamentos</Link>
                <Link href="/produtos?oferta=true" className="text-sm text-[#fff8ef] transition-colors hover:text-accent">Ofertas</Link>
              </nav>
            )}
            {searchBox}
            <div className="flex items-center gap-1">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-ink transition-colors hover:bg-card-hover"
                  >
                    Olá, {userName}
                    <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card-hover py-1">
                      <Link href="/conta" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-card">Minhas compras</Link>
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-card">Sair</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)} className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors ${overlay ? 'border border-[#fff8ef]/50 text-[#fff8ef] hover:bg-[#fff8ef]/10' : 'px-3 text-ink hover:bg-card-hover'}`}>
                    {overlay && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>}
                    Entrar
                  </button>
                  {!overlay && <button onClick={() => router.push(`/login?tab=signup&returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)} className="btn-outline !min-h-[40px] !px-4 !py-2 !text-sm">Criar conta</button>}
                </>
              )}
              {!overlay && <Link href="/conta" className="flex h-11 items-center rounded-lg px-3 text-sm text-ink transition-colors hover:bg-card-hover">Compras</Link>}
              {cartButton}
            </div>
          </div>
          {!overlay && <div className="pb-3">{categoryRow}</div>}
        </div>
      </header>
      </div>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
