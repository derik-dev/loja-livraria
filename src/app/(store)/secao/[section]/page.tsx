'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import { Product, FilterState } from '@/lib/types'
import { ProductGrid, ProductFilters } from '@/components/product'
import { PageHero } from '@/components/zine'
import { sectionBySlug } from '@/lib/nav'

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

export default function SecaoPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params)
  const meta = sectionBySlug(section)
  if (!meta) notFound()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  /* AI Search */
  const [query, setQuery] = useState('')
  const [aiResults, setAiResults] = useState<Product[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').contains('section', [section]).then(({ data, error }) => {
      if (error) console.error('[Supabase] section:', error)
      setProducts((data ?? []).map(mapProduct))
      setLoading(false)
    })
  }, [section])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const runAiSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setAiResults(null); setAiLoading(false); return }
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
    if (!value.trim()) { setAiResults(null); setAiLoading(false); return }
    setAiLoading(true)
    debounceRef.current = setTimeout(() => runAiSearch(value), 600)
  }

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

  return (
    <div className="bg-white min-h-screen">

      <PageHero title={meta.label} note={meta.note} color={meta.color} />

      {/* Content */}
      <div className="px-4 sm:px-14 lg:px-20 py-4 sm:py-6">

        {/* AI Search */}
        <div className="mb-5">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={`Descreva o que quer ler em ${meta.label}...`}
              className="w-full border border-zinc-300 bg-white px-4 py-3 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
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
            <p className="mt-1.5 text-xs text-zinc-400">
              {aiLoading ? 'Procurando nas estantes…' : aiResults !== null ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query}"` : ''}
            </p>
          )}
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.14em]">
            Resultado ({loading ? '...' : filtered.length})
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFiltersVisible(v => !v)} className="lg:hidden border border-zinc-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors">
              Filtro
            </button>
            {!query.trim() && (
              <div className="relative" ref={sortRef}>
                <button onClick={() => setSortOpen(v => !v)} className="flex items-center gap-3 border border-zinc-300 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-800 hover:border-zinc-900 transition-colors whitespace-nowrap">
                  ORDENAR POR
                  <svg className={`h-3 w-3 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-white border-[3px] border-[var(--z-ink)] min-w-[200px] shadow-[5px_5px_0_var(--z-ink)]">
                    {SORT_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => { setFilters(f => ({ ...f, sortBy: opt.value })); setSortOpen(false) }}
                        className={`w-full text-left px-5 py-3 text-xs uppercase tracking-[0.14em] hover:bg-zinc-50 transition-colors ${filters.sortBy === opt.value ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>
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
        <div className="flex gap-10">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <ProductFilters filters={filters} onChange={setFilters} />
          </aside>

          {filtersVisible && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersVisible(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-900">Filtros</h2>
                  <button onClick={() => setFiltersVisible(false)} className="text-zinc-400 hover:text-zinc-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductFilters filters={filters} onChange={(f) => { setFilters(f); setFiltersVisible(false) }} />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-zinc-400 py-20 text-center">Folheando as estantes…</p>
            ) : aiLoading && aiResults === null ? (
              <p className="text-sm text-zinc-400 py-20 text-center">Procurando nas estantes…</p>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                {query.trim() ? (
                  <>
                    <p className="text-sm font-medium text-zinc-700 mb-1">Nenhum livro encontrado para &quot;{query}&quot;</p>
                    <p className="text-xs text-zinc-400">Tente descrever de outra forma.</p>
                  </>
                ) : (
                  <p className="text-sm text-zinc-400">Nenhum livro nesta prateleira ainda.</p>
                )}
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
