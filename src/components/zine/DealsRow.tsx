'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import ProductCard from '@/components/product/ProductCard'
import { BookImage } from './BookCover'

/** "Oferta do dia" (maior desconto do catálogo) ao lado de um carrossel de ofertas. */
export default function DealsRow({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const onSale = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => calculateDiscount(b.originalPrice!, b.price) - calculateDiscount(a.originalPrice!, a.price))

  // Sem produtos em oferta ainda: mostra os mais recentes, com o título certo.
  const hasDeals = onSale.length > 0
  const list = hasDeals ? onSale : products
  const featured = list[0]
  const rest = list.slice(1, 9)

  if (!featured) return null

  const discount = featured.originalPrice ? calculateDiscount(featured.originalPrice, featured.price) : null

  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-4 lg:grid-cols-[340px_1fr]">
        <div className="bk-card flex flex-col p-6">
          <h2 className="z-plain text-xl font-semibold">{hasDeals ? 'Oferta do dia' : 'Destaque do dia'}</h2>
          <Link href={`/produto/${featured.slug}`} className="bk-lift group mt-5 flex flex-1 flex-col">
            <div className="flex justify-center rounded-md bg-[var(--bk-paper)]/70 px-8 py-6">
              <div className="bk-cover w-[150px] overflow-hidden" style={{ aspectRatio: '2 / 3' }}>
                <BookImage src={featured.images[0]} title={featured.name} />
              </div>
            </div>
            <p className="z-plain mt-5 line-clamp-2 text-[15px] leading-snug text-[var(--bk-ink)]/85 group-hover:text-[var(--bk-navy-2)]">{featured.name}</p>
            {featured.originalPrice && <p className="mt-2 text-[13px] text-zinc-400 line-through">{formatCurrency(featured.originalPrice)}</p>}
            <p className="flex items-baseline gap-2">
              <span className="text-[1.75rem] font-medium leading-tight">{formatCurrency(featured.price)}</span>
              {discount && <span className="text-sm font-semibold text-[var(--bk-green)]">{discount}% OFF</span>}
            </p>
          </Link>
          <Link href={`/produto/${featured.slug}`} className="bk-btn mt-5 w-full">Ver livro</Link>
        </div>

        <div className="bk-card min-w-0 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="z-plain text-xl font-semibold">{hasDeals ? 'Ofertas' : 'Mais recentes'}</h2>
            <Link href="/produtos" className="bk-link text-sm font-medium">{hasDeals ? 'Mostrar todas as ofertas' : 'Ver o catálogo'}</Link>
          </div>

          <div className="relative mt-5">
            <div ref={scrollRef} className="bk-noscroll flex gap-4 overflow-x-auto pb-2">
              {(rest.length > 0 ? rest : list).map((p) => (
                <div key={p.id} className="w-[210px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            {rest.length > 3 && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 440, behavior: 'smooth' })}
                aria-label="Próximos"
                className="absolute -right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgb(20_40_75/0.3)] transition-colors hover:text-[var(--bk-gold)] lg:flex"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
