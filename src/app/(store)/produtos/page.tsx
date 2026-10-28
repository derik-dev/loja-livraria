'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { mockProducts } from '@/lib/data/products'
import { Product, FilterState } from '@/lib/types'
import { ProductGrid, ProductFilters } from '@/components/product'
import { PageHero } from '@/components/zine'

const defaultFilters: FilterState = {
  category: null,
  minPrice: null,
  maxPrice: null,
  sortBy: 'newest',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'rating', label: 'Melhor avaliação' },
] as const

export default function ProdutosPage() {
  const products = mockProducts
  const loading = false
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  /* ── AI Search ── */
  const [query, setQuery] = useState('')
  const [aiResults, setAiResults] = useState<Product[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const runAiSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAiResults(null)
      setAiLoading(false)
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, products }),
      })
      const data = await res.json()
      setAiResults(data.products ?? [])
    } catch {
      setAiResults([])
    } finally {
      setAiLoading(false)
    }
  }, [products])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setAiResults(null)
      setAiLoading(false)
      return
    }
    setAiLoading(true)
    debounceRef.current = setTimeout(() => runAiSearch(value), 600)
  }

  /* Base list: AI results (when searching) or all products */
  const baseList = query.trim() ? (aiResults ?? []) : products

  const filtered = useMemo(() => {
    let list = [...baseList]
    if (filters.category) list = list.filter((p) => p.category === filters.category)
    if (filters.minPrice !== null) list = list.filter((p) => p.price >= filters.minPrice!)
    if (filters.maxPrice !== null) list = list.filter((p) => p.price <= filters.maxPrice!)
    if (!query.trim()) {
      switch (filters.sortBy) {
        case 'price-asc': list.sort((a, b) => a.price - b.price); break
        case 'price-desc': list.sort((a, b) => b.price - a.price); break
        case 'rating': list.sort((a, b) => b.rating - a.rating); break
      }
    }
    return list
  }, [baseList, filters, query])

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ?? 'Mais recentes'

  return (
    <div>
      <div data-tone="dark">
        <PageHero title="Todos os livros" note="Catálogo completo" image="/banners/catalogo.png" wide />
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <div data-tone="light" className="min-h-[60vh] px-4 py-8 md:px-12 md:py-12 lg:px-20">

        {/* ── AI SEARCH BAR ── */}
        <div className="mb-5">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Descreva o livro que você quer — ex: 'um romance leve pra viagem'"
              className="w-full rounded-full border border-border-strong bg-card px-5 py-3 pr-12 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              {aiLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
            </span>
          </div>
          {query.trim() && (
            <p className="mt-2 text-xs text-muted">
              {aiLoading
                ? 'Procurando nas estantes…'
                : aiResults !== null
                  ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query}"`
                  : ''}
            </p>
          )}
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Resultado ({loading ? '...' : filtered.length})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersVisible((v) => !v)}
              className="btn-outline !min-h-[40px] !px-4 !py-2 !text-sm lg:hidden"
            >
              Filtro
            </button>

            {/* Ordenar — oculto durante busca IA */}
            {!query.trim() && (
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="btn-outline !min-h-[40px] !gap-3 !px-4 !py-2 !text-sm whitespace-nowrap"
                >
                  Ordenar por
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="surface absolute right-0 top-full z-30 mt-2 min-w-[210px] overflow-hidden py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilters((f) => ({ ...f, sortBy: opt.value }))
                          setSortOpen(false)
                        }}
                        className={`w-full px-5 py-2.5 text-left text-sm transition-colors hover:bg-card-hover ${
                          filters.sortBy === opt.value ? 'font-semibold text-accent' : 'text-ink'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar + Grid */}
        <div className="flex gap-10 xl:gap-14">

          {/* Desktop sidebar */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-6">
            <ProductFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Mobile filters overlay */}
          {filtersVisible && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersVisible(false)} />
              <div className="relative ml-auto h-full w-72 overflow-y-auto bg-bg p-8 text-ink">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-semibold text-ink">Filtros</h2>
                  <button onClick={() => setFiltersVisible(false)} className="text-muted hover:text-ink">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductFilters filters={filters} onChange={(f) => { setFilters(f); setFiltersVisible(false) }} />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="py-20 text-center text-sm text-muted">Folheando as estantes…</p>
            ) : aiLoading && aiResults === null ? (
              <p className="py-20 text-center text-sm text-muted">Procurando nas estantes…</p>
            ) : filtered.length === 0 && query.trim() ? (
              <div className="py-20 text-center">
                <p className="mb-1 text-sm font-medium text-ink">Nenhum livro encontrado para &quot;{query}&quot;</p>
                <p className="text-xs text-muted">Tente descrever de outra forma.</p>
              </div>
            ) : (
              <ProductGrid products={filtered} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
