'use client'

import { useState } from 'react'
import { FilterState } from '@/lib/types'
import { mockCategories } from '@/lib/data/products'

interface ProductFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      {children}
    </div>
  )
}

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
        checked ? 'border-accent bg-accent text-on-accent' : 'border-border-strong bg-card'
      }`}
    >
      {checked && <span className="h-1.5 w-1.5 rounded-full bg-on-accent" />}
    </span>
  )
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? '')
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? '')
  const [showMoreCat, setShowMoreCat] = useState(false)
  const categories = mockCategories

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
  const priceInput = 'w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none'

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-lg font-semibold text-ink">Filtros</span>
        <button onClick={reset} className="text-xs font-semibold text-accent underline-offset-4 hover:underline">
          Limpar
        </button>
      </div>

      <FilterSection title="Gênero">
        <div className="space-y-2.5">
          <label className="group flex cursor-pointer items-center gap-2.5">
            <Box checked={filters.category === null} />
            <input type="radio" name="category" checked={filters.category === null} onChange={() => update({ category: null })} className="sr-only" />
            <span className="text-sm text-ink">Todos</span>
          </label>
          {visibleCats.map((cat) => (
            <label key={cat.slug} className="group flex cursor-pointer items-center gap-2.5">
              <Box checked={filters.category === cat.slug} />
              <input type="radio" name="category" checked={filters.category === cat.slug} onChange={() => update({ category: cat.slug })} className="sr-only" />
              <span className={`text-sm text-ink transition-colors group-hover:text-accent ${filters.category === cat.slug ? 'font-semibold' : ''}`}>{cat.name}</span>
            </label>
          ))}
          {categories.length > 6 && (
            <button
              onClick={() => setShowMoreCat((v) => !v)}
              className="mt-1 text-xs font-semibold text-accent underline-offset-4 hover:underline"
            >
              {showMoreCat ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Preço (R$)">
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Mín" value={localMin} onChange={(e) => setLocalMin(e.target.value)} className={priceInput} />
          <span className="flex-shrink-0 text-muted">–</span>
          <input type="number" placeholder="Máx" value={localMax} onChange={(e) => setLocalMax(e.target.value)} className={priceInput} />
        </div>
        <button onClick={applyPrice} className="btn-primary mt-4 w-full !min-h-[40px] !py-2 !text-sm">
          Aplicar
        </button>
      </FilterSection>
    </div>
  )
}
