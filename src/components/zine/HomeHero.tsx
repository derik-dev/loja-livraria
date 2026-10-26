'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { BookImage } from './BookCover'

/** Abertura da home: busca de catálogo à esquerda, prateleira de destaques à direita. */
export default function HomeHero({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const shelf = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(query.trim() ? `/produtos?q=${encodeURIComponent(query.trim())}` : '/produtos')
  }

  return (
    <section className="border-b border-[var(--bk-line)]">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-16 lg:py-20">
        <div className="bk-rise">
          <p className="bk-eyebrow">Catálogo online de livros</p>
          <h1 className="bk-display mt-4 text-[clamp(2.4rem,5.4vw,4.6rem)]">
            O próximo livro que você vai <em className="bk-italic text-[var(--bk-burgundy)]">querer ler</em> está aqui.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--bk-ink-soft)]">
            Ficção, não ficção, clássicos e papelaria, com preço claro, estoque à vista e entrega para todo o Brasil.
          </p>

          <form onSubmit={submit} className="mt-8 flex max-w-xl border border-[var(--bk-ink)] bg-[#fffaf0] shadow-[0_10px_24px_-16px_rgb(36_27_21/0.5)]" role="search">
            <label htmlFor="home-search" className="sr-only">Buscar no catálogo</label>
            <input
              id="home-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por título ou assunto…"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base"
              style={{ border: 0, boxShadow: 'none', background: 'transparent' }}
            />
            <button type="submit" className="bk-btn m-1.5 !px-6">Buscar</button>
          </form>

          <p className="mt-5 text-sm text-[var(--bk-ink-soft)]">
            Ou explore por{' '}
            <Link href="/secao/masculino" className="bk-link font-semibold text-[var(--bk-ink)]">Ficção</Link>,{' '}
            <Link href="/secao/feminino" className="bk-link font-semibold text-[var(--bk-ink)]">Não-ficção</Link> e{' '}
            <Link href="/secao/inverno" className="bk-link font-semibold text-[var(--bk-ink)]">Clássicos</Link>.
          </p>
        </div>

        {/* Prateleira de destaques */}
        <div className="bk-rise" style={{ animationDelay: '0.15s' }}>
          <div className="bk-frame px-5 pb-6 pt-5 sm:px-8">
            <div className="flex items-center justify-between border-b border-[var(--bk-line)] pb-3">
              <p className="bk-eyebrow">Em destaque na estante</p>
              <Link href="/produtos" className="bk-link text-xs font-semibold uppercase tracking-[0.14em]">Ver tudo</Link>
            </div>

            {shelf.length === 0 ? (
              <p className="py-16 text-center text-sm text-[var(--bk-ink-soft)]">Arrumando a estante…</p>
            ) : (
              <>
                <ul className="mt-6 grid grid-cols-4 items-end gap-3 sm:gap-5">
                  {shelf.map((p) => (
                    <li key={p.id}>
                      <Link href={`/produto/${p.slug}`} className="bk-lift group block" title={p.name}>
                        <div className="bk-cover overflow-hidden" style={{ aspectRatio: '2 / 3' }}>
                          <BookImage src={p.images[0]} title={p.name} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* tábua da prateleira */}
                <div className="-mx-1 mt-0 h-3 bg-gradient-to-b from-[#7a5a38] to-[#4e3720] shadow-[0_6px_10px_-4px_rgb(36_27_21/0.6)]" aria-hidden="true" />

                <ol className="mt-5 space-y-2.5">
                  {shelf.slice(0, 3).map((p) => (
                    <li key={p.id} className="flex items-baseline gap-3 text-sm">
                      <Link href={`/produto/${p.slug}`} className="min-w-0 truncate font-semibold hover:text-[var(--bk-burgundy)]">{p.name}</Link>
                      <span className="mt-1 flex-1 border-b border-dotted border-[var(--bk-ink)]/40" aria-hidden="true" />
                      <span className="font-semibold">{formatCurrency(p.price)}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
