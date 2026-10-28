'use client'

import { useMemo, useState } from 'react'
import AuthorCard, { AUTHOR_TONES } from './AuthorCard'

interface AuthorItem {
  name: string
  slug: string
  count: number
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Lista de autores com barra de pesquisa (ignora acentos e maiúsculas). */
export default function AuthorsBrowser({ authors }: { authors: AuthorItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return authors
    return authors.filter((a) => normalize(a.name).includes(q))
  }, [authors, query])

  return (
    <div>
      <div className="relative max-w-xl">
        <label htmlFor="busca-autor" className="sr-only">Pesquisar autor</label>
        <input
          id="busca-autor"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar autor, por exemplo: Orwell"
          autoComplete="off"
          className="w-full rounded-full border border-border-strong bg-card px-5 py-3 pr-12 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
        />
        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <p className="mb-8 mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted" role="status">
        {query.trim() ? `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'} para "${query.trim()}"` : `${authors.length} autores no catálogo`}
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-medium text-ink">Nenhum autor encontrado.</p>
          <p className="mt-1 text-sm text-muted">Confira a grafia ou pesquise só uma parte do nome.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a, i) => (
            <li key={a.slug}>
              <AuthorCard name={a.name} count={a.count} href={`/autores/${a.slug}`} tone={AUTHOR_TONES[i % AUTHOR_TONES.length]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
