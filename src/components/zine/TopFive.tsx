import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from './BookCover'

/** Faixa branca "Mais procurados": destaques primeiro; se faltar, completa pela nota. */
export default function TopFive({ products }: { products: Product[] }) {
  const ranked = [...products].sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating).slice(0, 5)
  if (ranked.length === 0) return null

  return (
    <section id="mais-procurados" className="mt-10 scroll-mt-32 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="z-plain text-2xl font-semibold">Mais procurados</h2>
          <Link href="/produtos" className="bk-link text-sm font-medium">Ver o catálogo</Link>
        </div>

        <ol className="mt-6 grid gap-x-8 lg:grid-cols-2">
          {ranked.map((p, i) => {
            const discount = p.originalPrice ? calculateDiscount(p.originalPrice, p.price) : null
            return (
              <li key={p.id} className="border-b border-[var(--bk-paper-2)]">
                <Link href={`/produto/${p.slug}`} className="group flex items-center gap-4 py-4">
                  <span className="w-8 flex-shrink-0 text-center text-3xl font-light text-[var(--bk-gold)]">{i + 1}</span>
                  <div className="bk-cover h-[96px] w-16 flex-shrink-0 overflow-hidden">
                    <BookImage src={p.images[0]} title={p.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--bk-ink-soft)]">{p.category}</p>
                    <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug transition-colors group-hover:text-[var(--bk-navy-2)]">{p.name}</p>
                    {p.reviewCount > 0 && (
                      <p className="mt-1 text-xs text-[var(--bk-ink-soft)]">
                        <span className="text-[var(--bk-gold)]">★</span> {p.rating} ({p.reviewCount.toLocaleString('pt-BR')})
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {p.originalPrice && <p className="text-xs text-zinc-400 line-through">{formatCurrency(p.originalPrice)}</p>}
                    <p className="text-lg font-medium">{formatCurrency(p.price)}</p>
                    {discount && <p className="text-xs font-semibold text-[var(--bk-green)]">{discount}% OFF</p>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
