'use client'

import { useEffect, useState } from 'react'
import { FilterState } from '@/lib/types'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { fallbackCategories, type FilterCategory } from '@/lib/data/categories'

interface ProductFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b-2 border-dashed border-[var(--z-ink)]/40 py-5">
      <h3 className="z-plain mb-3 text-sm font-bold uppercase tracking-[0.14em]">{title}</h3>
      {children}
    </div>
  )
}

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center border-[2.5px] border-[var(--z-ink)] transition-colors"
      style={{ background: checked ? 'var(--z-yellow)' : '#fffdf6' }}
    >
      {checked && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
          <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
        </svg>
      )}
    </span>
  )
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? '')
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? '')
  const [showMoreCat, setShowMoreCat] = useState(false)
  const [categories, setCategories] = useState<FilterCategory[]>(fallbackCategories)

  // As categorias vêm da mesma tabela que o admin edita; se falhar, fica a lista de gêneros padrão.
  useEffect(() => {
    supabase
      .from('categories')
      .select('slug, name')
      .eq('active', true)
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) setCategories(data as FilterCategory[])
      })
  }, [])

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial })

  const applyPrice = () => {
    update({
      minPrice: localMin ? Number(localMin) : null,
      maxPrice: localMax ? Number(localMax) : null,
    })
  }

  const reset = () => {
    setLocalMin('')
    setLocalMax('')
    onChange({ category: null, minPrice: null, maxPrice: null, sortBy: 'newest' })
  }

  const visibleCats = showMoreCat ? categories : categories.slice(0, 6)

  return (
    <div>
      <div className="flex items-center justify-between border-b-[3px] border-[var(--z-ink)] pb-3">
        <span className="z-display text-xl">Filtros</span>
        <button onClick={reset} className="text-xs font-bold underline underline-offset-4 hover:text-[var(--z-red)]">
          limpar
        </button>
      </div>

      <FilterSection title="Gênero">
        <div className="space-y-2.5">
          <label className="group flex cursor-pointer items-center gap-2.5">
            <Box checked={filters.category === null} />
            <input type="radio" name="category" checked={filters.category === null} onChange={() => update({ category: null })} className="sr-only" />
            <span className="text-sm font-medium">Todos</span>
          </label>
          {visibleCats.map((cat) => (
            <label key={cat.slug} className="group flex cursor-pointer items-center gap-2.5">
              <Box checked={filters.category === cat.slug} />
              <input type="radio" name="category" checked={filters.category === cat.slug} onChange={() => update({ category: cat.slug })} className="sr-only" />
              <span className="text-sm font-medium group-hover:underline group-hover:underline-offset-4">{cat.name}</span>
            </label>
          ))}
          {categories.length > 6 && (
            <button
              onClick={() => setShowMoreCat((v) => !v)}
              className="mt-1 text-xs font-bold underline underline-offset-4 hover:text-[var(--z-red)]"
            >
              {showMoreCat ? 'ver menos' : 'ver mais'}
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Preço (R$)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-full px-2 py-2 text-sm"
          />
          <span className="flex-shrink-0 font-bold">–</span>
          <input
            type="number"
            placeholder="Máx"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-full px-2 py-2 text-sm"
          />
        </div>
        <button onClick={applyPrice} className="z-btn z-btn--ink mt-4 w-full !py-2.5 !text-xs">
          Aplicar
        </button>
      </FilterSection>
    </div>
  )
}
